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

import com.imatoilet.backend.dto.ImportResultDto;
import com.imatoilet.backend.dto.ToiletImportItemDto;

@Service
@Transactional
public class ToiletService {

    private final ToiletRepository toiletRepository;

    public ToiletService(ToiletRepository toiletRepository) {
        this.toiletRepository = toiletRepository;
    }

    // ★修正: 引数に bounds (minLat, maxLat, minLng, maxLng) を追加
    public Page<Toilet> searchToilets(
            Double minLat, Double maxLat, Double minLng, Double maxLng,
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

        // ★修正: Bounds指定があればそれを最優先、なければ既存のRadius検索、どちらもなければ通常検索
        if (minLat != null && maxLat != null && minLng != null && maxLng != null) {
            idPage = toiletRepository.findIdsWithinBoundsWithSpecs(
                    minLat, maxLat, minLng, maxLng, facilityCategory, minCleanliness, keyword, publicUse, typeStrs, typeCount.intValue(), pageable);
        } else if (lat != null && lng != null) {
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
        if (details.getSource() != null) toilet.setSource(details.getSource());
        if (details.getSourceUrl() != null) toilet.setSourceUrl(details.getSourceUrl());
        if (details.getLastVerified() != null) toilet.setLastVerified(details.getLastVerified());
        
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

    private void updateEquipmentList(Toilet toilet, List<String> inputs) {
        if (inputs == null) return;
        
        List<EquipmentType> newTypes = new ArrayList<>();
        for (String typeStr : inputs) {
            try {
                newTypes.add(EquipmentType.valueOf(typeStr));
            } catch (IllegalArgumentException ignored) {}
        }

        toilet.getEquipmentList().removeIf(e -> !newTypes.contains(e.getType()));

        List<EquipmentType> currentTypes = toilet.getEquipmentList().stream()
                .map(Equipment::getType)
                .collect(Collectors.toList());

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

    public ImportResultDto importToilets(List<ToiletImportItemDto> items) {
        int inserted = 0;
        int skipped = 0;
        List<String> skippedReasons = new ArrayList<>();

        for (ToiletImportItemDto item : items) {
            // 50m以内の重複チェック（0.05km）
            List<Long> nearby = toiletRepository.findNearbyToiletIds(
                    item.getLat(), item.getLng(), 0.05);
            if (!nearby.isEmpty()) {
                skipped++;
                skippedReasons.add(String.format(
                        "lat=%.6f,lng=%.6f: 既存ID#%dと重複",
                        item.getLat(), item.getLng(), nearby.get(0)));
                continue;
            }

            // 新規登録
            Toilet toilet = new Toilet();
            toilet.setName(item.getName() != null && !item.getName().isBlank()
                    ? item.getName() : "公衆トイレ");
            toilet.setLat(item.getLat());
            toilet.setLng(item.getLng());
            toilet.setAddress(item.getAddress());
            toilet.setPublicUse(item.getPublicUse());
            toilet.setFacilityCategory(item.getFacilityCategory());
            toilet.setSource(item.getSource());
            toilet.setSourceUrl(item.getSourceUrl());
            toilet.setLastVerified(item.getLastVerified());
            toilet.setCleanliness(3);

            Toilet saved = toiletRepository.save(toilet);

            if (item.getEquipment() != null && !item.getEquipment().isEmpty()) {
                updateEquipmentList(saved, item.getEquipment());
                toiletRepository.save(saved);
            }

            inserted++;
        }

        ImportResultDto result = new ImportResultDto();
        result.setInserted(inserted);
        result.setSkipped(skipped);
        result.setSkippedReasons(skippedReasons);
        return result;
    }
}