package com.imatoilet.backend;

import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private ToiletRepository toiletRepository;

    // --- 検索ロジック ---
    public List<Toilet> searchToilets(
            Double lat, Double lng, Double radius,
            String facilityCategory, Integer minCleanliness,
            String keyword, List<String> equipment
    ) {
        // 1. まずベースとなるリストを取得
        List<Toilet> results;

        if (lat != null && lng != null) {
            // 位置情報がある場合：半径検索を実行
            double r = (radius != null) ? radius : 5.0;
            results = toiletRepository.findWithinRadius(lat, lng, r);
        } else {
            // 位置情報がない場合：条件検索または全件取得
            // EquipmentTypeへの変換
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

            // 修正7: typesのサイズをカウントして渡す (AND検索用)
            Long typeCount = (types != null) ? (long) types.size() : null;

            // 条件が一つでもあれば検索、なければ全件
            if (facilityCategory != null || minCleanliness != null || keyword != null || types != null) {
                // 修正7: 引数に typeCount を追加して呼び出す
                return toiletRepository.searchBySpecs(facilityCategory, minCleanliness, keyword, types, typeCount);
            } else {
                return toiletRepository.findAll();
            }
        }

        // 2. 位置情報検索の結果に対して、さらに条件でフィルタリング (Java側で実行)
        // ※ searchBySpecs相当のロジックをストリームで適用
        return results.stream()
            .filter(t -> {
                // (A) カテゴリ判定
                if (facilityCategory != null && !facilityCategory.isEmpty()) {
                    if (!facilityCategory.equals(t.getFacilityCategory())) return false;
                }
                
                // (B) 清潔度判定
                if (minCleanliness != null) {
                    if (t.getCleanliness() == null || t.getCleanliness() < minCleanliness) return false;
                }
                
                // (C) キーワード判定 (名前、住所、説明、設備文字列)
                if (keyword != null && !keyword.isEmpty()) {
                    String k = keyword.toLowerCase();
                    boolean matchName = t.getName() != null && t.getName().toLowerCase().contains(k);
                    boolean matchAddr = t.getAddress() != null && t.getAddress().toLowerCase().contains(k);
                    boolean matchDesc = t.getDescription() != null && t.getDescription().toLowerCase().contains(k);
                    boolean matchEq   = t.getEquipment() != null && t.getEquipment().toLowerCase().contains(k);
                    
                    if (!matchName && !matchAddr && !matchDesc && !matchEq) return false;
                }
                
                // (D) 設備判定 (AND条件: 指定された設備すべてを持っているか)
                if (equipment != null && !equipment.isEmpty()) {
                    // トイレ側の equipment 文字列 (CSV) を取得
                    String tEq = (t.getEquipment() != null) ? t.getEquipment() : "";
                    
                    for (String req : equipment) {
                        // CSV文字列の中に、指定された設備キーが含まれているか確認
                        // 例: req="WHEELCHAIR" -> tEq="wheelchair,diaper" (大文字小文字の違いを吸収するか要検討だが、
                        // 現状のデータは小文字、リクエストは大文字の可能性があるため、toLowerCaseで合わせるのが安全)
                        if (!tEq.toLowerCase().contains(req.toLowerCase())) {
                            return false; 
                        }
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
    }

    // --- ID検索 ---
    public Toilet getToilet(Long id) {
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
        Long safeId = Objects.requireNonNull(id, "ID must not be null");

        if (!toiletRepository.existsById(safeId)) {
            throw new ResourceNotFoundException("トイレ", "id", safeId);
        }
        toiletRepository.deleteById(safeId);
    }
}