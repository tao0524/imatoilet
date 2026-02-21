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

    public Page<Toilet> searchToilets(
            Double lat, Double lng, Double radius,
            String facilityCategory, Integer minCleanliness,
            String keyword, Boolean publicUse, List<String> equipment,
            Pageable pageable
    ) {
        Page<Long> idPage;

        List<EquipmentType> types = convertToEnumList(equipment);
        Long typeCount = (types != null) ? (long) types.size() : 0L;
        
        List<String> typeStrs = (equipment != null && !equipment.isEmpty()) ? equipment : List.of("DUMMY_TYPE");
        List<EquipmentType> safeTypes = (types != null && !types.isEmpty()) ? types : List.of(EquipmentType.WHEELCHAIR);

        if (lat != null && lng != null) {
            double r = (radius != null) ? radius : 5.0;
            idPage = toiletRepository.findIdsWithinRadiusWithSpecs(
                    lat, lng, r, facilityCategory, minCleanliness, keyword, publicUse, typeStrs, typeCount.intValue(), pageable);
        } else {
            idPage = toiletRepository.searchIdsBySpecs(
                    facilityCategory, minCleanliness, keyword, publicUse, safeTypes, typeCount, pageable);
        }

        if (idPage.isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, idPage.getTotalElements());
        }

        List<Toilet> toilets = toiletRepository.findAllByIdWithEquipment(idPage.getContent());

        Map<Long, Toilet> toiletMap = toilets.stream()
                .collect(Collectors.toMap(Toilet::getId, Function.identity()));
        List<Toilet> sortedToilets = idPage.getContent().stream()
                .map(toiletMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new PageImpl<>(sortedToilets, pageable, idPage.getTotalElements());
    }

    public Toilet getToilet(Long id) {
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        return toiletRepository.findById(safeId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", safeId));
    }

    public Toilet createToilet(Toilet toilet) {
        if (toilet.getCleanliness() == null) {
            toilet.setCleanliness(3);
        }
        
        Toilet savedToilet = toiletRepository.save(toilet);
        updateEquipmentList(savedToilet, toilet.getEquipmentInput());
        return toiletRepository.save(savedToilet);
    }

    public Toilet updateToilet(Long id, Toilet details) {
        Toilet toilet = getToilet(id);

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
        }

        Optional.ofNullable(details.getPublicUse()).ifPresent(toilet::setPublicUse);
        Optional.ofNullable(details.getTypePark()).ifPresent(toilet::setTypePark);
        Optional.ofNullable(details.getTypeStation()).ifPresent(toilet::setTypeStation);
        Optional.ofNullable(details.getTypeMall()).ifPresent(toilet::setTypeMall);

        return toiletRepository.save(toilet);
    }

    public void deleteToilet(Long id) {
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        if (!toiletRepository.existsById(safeId)) {
            throw new ResourceNotFoundException("トイレ", "id", safeId);
        }
        toiletRepository.deleteById(safeId);
    }

    // ★修正: 重複エラーを防ぐための差分同期ロジック
    private void updateEquipmentList(Toilet toilet, List<String> inputs) {
        if (inputs == null) return;
        
        // 入力された文字列を Enum のリストに変換
        List<EquipmentType> newTypes = new ArrayList<>();
        for (String typeStr : inputs) {
            try {
                newTypes.add(EquipmentType.valueOf(typeStr));
            } catch (IllegalArgumentException ignored) {}
        }

        // 1. 古いリストから、新リストに含まれないものを削除
        toilet.getEquipmentList().removeIf(e -> !newTypes.contains(e.getType()));

        // 2. 現在のリストに残っている設備の Type を抽出
        List<EquipmentType> currentTypes = toilet.getEquipmentList().stream()
                .map(Equipment::getType)
                .collect(Collectors.toList());

        // 3. 新リストのうち、まだ登録されていないものだけを追加
        for (EquipmentType type : newTypes) {
            if (!currentTypes.contains(type)) {
                toilet.addEquipment(type);
            }
        }
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