package com.imatoilet.backend;

import com.imatoilet.backend.exception.ResourceNotFoundException;
import com.imatoilet.backend.dto.ToiletUpdateDto; // 必要であればimport
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ToiletService {

    private final ToiletRepository toiletRepository;

    public ToiletService(ToiletRepository toiletRepository) {
        this.toiletRepository = toiletRepository;
    }

    // --- 検索ロジック ---
    public List<Toilet> searchToilets(
            Double lat, Double lng, Double radius,
            String facilityCategory, Integer minCleanliness,
            String keyword, List<String> equipment
    ) {
        // 1. まずベースとなるリストを取得
        List<Toilet> results;

        if (lat != null && lng != null) {
            // 位置情報あり
            double r = (radius != null) ? radius : 5.0;
            List<Long> ids = toiletRepository.findIdsWithinRadius(lat, lng, r);

            if (ids.isEmpty()) return new ArrayList<>();
            results = toiletRepository.findAllByIdWithEquipment(ids);
        } else {
            // 位置情報なし（条件検索）
            List<EquipmentType> types = convertToEnumList(equipment);
            Long typeCount = (types != null) ? (long) types.size() : null;

            if (facilityCategory != null || minCleanliness != null || keyword != null || types != null) {
                List<Long> ids = toiletRepository.searchIdsBySpecs(facilityCategory, minCleanliness, keyword, types, typeCount);
                if (ids.isEmpty()) return new ArrayList<>();
                return toiletRepository.findAllByIdWithEquipment(ids);
            } else {
                return toiletRepository.findAll();
            }
        }

        // 2. Java側フィルタリング
        return results.stream()
            .filter(t -> {
                if (facilityCategory != null && !facilityCategory.isEmpty()) {
                    if (!facilityCategory.equals(t.getFacilityCategory())) return false;
                }
                if (minCleanliness != null) {
                    if (t.getCleanliness() == null || t.getCleanliness() < minCleanliness) return false;
                }
                if (keyword != null && !keyword.isEmpty()) {
                    String k = keyword.toLowerCase();
                    boolean matchName = t.getName() != null && t.getName().toLowerCase().contains(k);
                    boolean matchAddr = t.getAddress() != null && t.getAddress().toLowerCase().contains(k);
                    boolean matchDesc = t.getDescription() != null && t.getDescription().toLowerCase().contains(k);
                    boolean matchEq = t.getEquipmentNames().stream()
                            .anyMatch(eqName -> eqName.toLowerCase().contains(k));
                    if (!matchName && !matchAddr && !matchDesc && !matchEq) return false;
                }
                if (equipment != null && !equipment.isEmpty()) {
                    List<String> holding = t.getEquipmentNames(); 
                    for (String req : equipment) {
                        boolean hasIt = holding.stream().anyMatch(h -> h.equalsIgnoreCase(req));
                        if (!hasIt) return false;
                    }
                }
                return true;
            })
            .limit(100)
            .collect(Collectors.toList());
    }

    // --- ID検索 ---
    public Toilet getToilet(Long id) {
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        // ★修正: 標準のfindByIdに戻す（Repository側でOverride済みのため安全）
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
            } catch (IllegalArgumentException e) { }
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
            } catch (IllegalArgumentException e) { }
        }
        return list.isEmpty() ? null : list;
    }
}