package com.imatoilet.backend;

import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class ToiletService {

    private final ToiletRepository toiletRepository;

    public ToiletService(ToiletRepository toiletRepository) {
        this.toiletRepository = toiletRepository;
    }

    // --- 検索ロジック (ページネーション対応＆DB側完全フィルタリング) ---
    public Page<Toilet> searchToilets(
            Double lat, Double lng, Double radius,
            String facilityCategory, Integer minCleanliness,
            String keyword, Boolean publicUse, List<String> equipment,
            Pageable pageable
    ) {
        Page<Long> idPage;

        List<EquipmentType> types = convertToEnumList(equipment);
        Long typeCount = (types != null) ? (long) types.size() : 0L;
        // ネイティブクエリ用に文字列リストを用意（空の場合はダミーを入れてIN句エラーを防ぐ）
        List<String> typeStrs = (equipment != null && !equipment.isEmpty()) ? equipment : List.of("DUMMY_TYPE");

        // 1. まずIDリストだけをページネーションで取得する
        if (lat != null && lng != null) {
            double r = (radius != null) ? radius : 5.0;
            idPage = toiletRepository.findIdsWithinRadiusWithSpecs(
                    lat, lng, r, facilityCategory, minCleanliness, keyword, publicUse, typeStrs, typeCount.intValue(), pageable);
        } else {
            idPage = toiletRepository.searchIdsBySpecs(
                    facilityCategory, minCleanliness, keyword, publicUse, types, typeCount, pageable);
        }

        if (idPage.isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, idPage.getTotalElements());
        }

        // 2. 取得したIDリストを使って、実体（Equipment含む）をまとめてフェッチする（N+1回避）
        List<Toilet> toilets = toiletRepository.findAllByIdWithEquipment(idPage.getContent());

        // 3. IN句検索は順序が保証されないため、元のIDリストの順番（距離順など）に並べ直す
        Map<Long, Toilet> toiletMap = toilets.stream()
                .collect(Collectors.toMap(Toilet::getId, Function.identity()));
        List<Toilet> sortedToilets = idPage.getContent().stream()
                .map(toiletMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new PageImpl<>(sortedToilets, pageable, idPage.getTotalElements());
    }

    // --- ID検索 ---
    public Toilet getToilet(Long id) {
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        // 標準のfindById（Repository側でOverride済みのためEquipmentもEagerロードされる）
        return toiletRepository.findById(safeId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", safeId));
    }

    // --- 新規登録 ---
    public Toilet createToilet(Toilet toilet) {
        if (toilet.getCleanliness() == null) {
            toilet.setCleanliness(3);
        }
        
        Toilet savedToilet = toiletRepository.save(toilet);
        updateEquipmentList(savedToilet, toilet.getEquipmentInput());
        
        // ※第2段階（DBマイグレーション）完了までは、後方互換性維持のためフラグ同期を残す
        syncFlagsFromEquipment(savedToilet);

        return toiletRepository.save(savedToilet);
    }

    // --- 更新 ---
    public Toilet updateToilet(Long id, Toilet details) {
        Toilet toilet = getToilet(id); // ここでfindByIdが呼ばれる

        Optional.ofNullable(details.getName()).filter(s -> !s.isBlank()).ifPresent(toilet::setName);
        if (details.getAddress() != null) toilet.setAddress(details.getAddress());
        if (details.getDescription() != null) toilet.setDescription(details.getDescription());
        if (details.getImage() != null) toilet.setImage(details.getImage());
        if (details.getFacilityCategory() != null) toilet.setFacilityCategory(details.getFacilityCategory());

        Optional.ofNullable(details.getLat()).ifPresent(toilet::setLat);
        Optional.ofNullable(details.getLng()).ifPresent(toilet::setLng);
        Optional.ofNullable(details.getCleanliness()).ifPresent(toilet::setCleanliness);

        if (details.getEquipmentInput() != null) {
            updateEquipmentList(toilet, details.getEquipmentInput());
            syncFlagsFromEquipment(toilet);
        }

        Optional.ofNullable(details.getPublicUse()).ifPresent(toilet::setPublicUse);
        Optional.ofNullable(details.getTypePark()).ifPresent(toilet::setTypePark);
        Optional.ofNullable(details.getTypeStation()).ifPresent(toilet::setTypeStation);
        Optional.ofNullable(details.getTypeMall()).ifPresent(toilet::setTypeMall);

        return toiletRepository.save(toilet);
    }

    // --- 削除 ---
    public void deleteToilet(Long id) {
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        if (!toiletRepository.existsById(safeId)) {
            throw new ResourceNotFoundException("トイレ", "id", safeId);
        }
        toiletRepository.deleteById(safeId);
    }

    // --- ヘルパーメソッド ---
    private void updateEquipmentList(Toilet toilet, List<String> inputs) {
        if (inputs == null) return;
        toilet.getEquipmentList().clear();
        for (String typeStr : inputs) {
            try {
                EquipmentType type = EquipmentType.valueOf(typeStr);
                toilet.addEquipment(type);
            } catch (IllegalArgumentException ignored) { 
                // 無効なEnum文字列は安全に無視する
            }
        }
    }

    private void syncFlagsFromEquipment(Toilet toilet) {
        List<String> names = toilet.getEquipmentNames();
        toilet.setWheelchair(names.contains("WHEELCHAIR"));
        toilet.setDiaper(names.contains("DIAPER"));
        toilet.setOpen24h(names.contains("OPEN_24H"));
    }

    private List<EquipmentType> convertToEnumList(List<String> inputs) {
        if (inputs == null || inputs.isEmpty()) return null;
        List<EquipmentType> list = new ArrayList<>();
        for (String s : inputs) {
            try {
                list.add(EquipmentType.valueOf(s));
            } catch (IllegalArgumentException ignored) { }
        }
        return list.isEmpty() ? null : list;
    }
}