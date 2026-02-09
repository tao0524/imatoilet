package com.imatoilet.backend;

import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects; // ★追加: Nullチェック用
import java.util.Optional;

@Service
@Transactional
public class ToiletService {

    @Autowired
    private ToiletRepository toiletRepository;

    // --- 検索ロジック ---
    public List<Toilet> searchToilets(
            Double lat, Double lng, Double radius,
            String facilityCategory, Integer minCleanliness,
            String keyword, List<String> equipment
    ) {
        // 1. 緯度経度による半径検索
        if (lat != null && lng != null) {
            double r = (radius != null) ? radius : 5.0;
            return toiletRepository.findWithinRadius(lat, lng, r);
        }

        // 2. 条件検索
        if (facilityCategory != null || minCleanliness != null || keyword != null || (equipment != null && !equipment.isEmpty())) {
            
            List<EquipmentType> types = null;
            if (equipment != null && !equipment.isEmpty()) {
                types = new ArrayList<>();
                for (String eq : equipment) {
                    try {
                        types.add(EquipmentType.valueOf(eq));
                    } catch (IllegalArgumentException e) {
                        // 無効な値は無視
                    }
                }
                if (types.isEmpty()) types = null;
            }

            return toiletRepository.searchBySpecs(facilityCategory, minCleanliness, keyword, types);
        }

        // 3. 全件取得
        return toiletRepository.findAll();
    }

    // --- ID検索 ---
    public Toilet getToilet(Long id) {
        // ★修正: nullチェックを行い、警告を解消
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        
        return toiletRepository.findById(safeId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", safeId));
    }

    // --- 新規登録 ---
    public Toilet createToilet(Toilet toilet) {
        if (toilet.getCleanliness() == null) {
            toilet.setCleanliness(3);
        }
        return toiletRepository.save(toilet);
    }

    // --- 更新ロジック ---
    public Toilet updateToilet(Long id, Toilet details) {
        // getToilet内でnullチェック済みなので、ここはそのまま呼び出すだけで安全
        Toilet toilet = getToilet(id);

        Optional.ofNullable(details.getName())
                .filter(s -> !s.isBlank())
                .ifPresent(toilet::setName);

        Optional.ofNullable(details.getAddress())
                .filter(s -> !s.isBlank())
                .ifPresent(toilet::setAddress);

        Optional.ofNullable(details.getDescription())
                .ifPresent(toilet::setDescription);

        Optional.ofNullable(details.getImage())
                .ifPresent(toilet::setImage);
        
        Optional.ofNullable(details.getFacilityCategory())
                .ifPresent(toilet::setFacilityCategory);

        Optional.ofNullable(details.getEquipment())
                .ifPresent(toilet::setEquipment);

        Optional.ofNullable(details.getLat()).ifPresent(toilet::setLat);
        Optional.ofNullable(details.getLng()).ifPresent(toilet::setLng);
        Optional.ofNullable(details.getCleanliness()).ifPresent(toilet::setCleanliness);

        Optional.ofNullable(details.getWheelchair()).ifPresent(toilet::setWheelchair);
        Optional.ofNullable(details.getDiaper()).ifPresent(toilet::setDiaper);
        Optional.ofNullable(details.getOpen24h()).ifPresent(toilet::setOpen24h);

        return toiletRepository.save(toilet);
    }

    // --- 削除 ---
    public void deleteToilet(Long id) {
        // ★修正: nullチェックを行い、警告を解消
        Long safeId = Objects.requireNonNull(id, "ID must not be null");

        if (!toiletRepository.existsById(safeId)) {
            throw new ResourceNotFoundException("トイレ", "id", safeId);
        }
        toiletRepository.deleteById(safeId);
    }
}