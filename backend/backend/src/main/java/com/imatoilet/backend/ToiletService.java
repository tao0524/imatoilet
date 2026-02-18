package com.imatoilet.backend;

import com.imatoilet.backend.exception.ResourceNotFoundException;
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

        // 2. Java側フィルタリング (Entityリストを使用)
        return results.stream()
            .filter(t -> {
                // (A) カテゴリ
                if (facilityCategory != null && !facilityCategory.isEmpty()) {
                    if (!facilityCategory.equals(t.getFacilityCategory())) return false;
                }
                
                // (B) 清潔度
                if (minCleanliness != null) {
                    if (t.getCleanliness() == null || t.getCleanliness() < minCleanliness) return false;
                }
                
                // (C) キーワード (名前、住所、説明、設備リストから検索)
                if (keyword != null && !keyword.isEmpty()) {
                    String k = keyword.toLowerCase();
                    boolean matchName = t.getName() != null && t.getName().toLowerCase().contains(k);
                    boolean matchAddr = t.getAddress() != null && t.getAddress().toLowerCase().contains(k);
                    boolean matchDesc = t.getDescription() != null && t.getDescription().toLowerCase().contains(k);
                    // 設備リスト内の文字列も検索対象にする
                    boolean matchEq = t.getEquipmentNames().stream()
                            .anyMatch(eqName -> eqName.toLowerCase().contains(k));
                    
                    if (!matchName && !matchAddr && !matchDesc && !matchEq) return false;
                }
                
                // (D) 設備 (AND条件)
                if (equipment != null && !equipment.isEmpty()) {
                    // トイレが持っている設備名のリスト
                    List<String> holding = t.getEquipmentNames(); 
                    for (String req : equipment) {
                        boolean hasIt = holding.stream().anyMatch(h -> h.equalsIgnoreCase(req));
                        if (!hasIt) return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
    }

    // --- ID検索 ---
    // ★修正: findByIdではなくfindWithEquipmentByIdを使用する。
    // findById()は@EntityGraphなしのLazyロードのため、トランザクション外の
    // JSON直列化時にequipmentList(equipment配列)が空になるバグを修正。
    public Toilet getToilet(Long id) {
        Long safeId = Objects.requireNonNull(id, "ID must not be null");
        return toiletRepository.findWithEquipmentById(safeId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", safeId));
    }

    // --- 新規登録 ---
    public Toilet createToilet(Toilet toilet) {
        if (toilet.getCleanliness() == null) {
            toilet.setCleanliness(3);
        }
        
        // 一旦トイレを保存してIDを発行
        Toilet savedToilet = toiletRepository.save(toilet);

        // inputリストからEquipmentエンティティを生成して保存
        updateEquipmentList(savedToilet, toilet.getEquipmentInput());
        
        // フラグ同期（互換性のため）
        syncFlagsFromEquipment(savedToilet);

        return toiletRepository.save(savedToilet);
    }

    // --- 更新 ---
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

        // 設備リストの更新
        if (details.getEquipmentInput() != null) {
            updateEquipmentList(toilet, details.getEquipmentInput());
            syncFlagsFromEquipment(toilet);
        }

        // 個別フラグが明示的に送られてきた場合の上書き（後方互換）
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

    // --- ヘルパー: EquipmentListの更新 ---
    private void updateEquipmentList(Toilet toilet, List<String> inputs) {
        if (inputs == null) return;

        // 既存の設備をクリア (orphanRemoval=true によりDBからも削除される)
        toilet.getEquipmentList().clear();

        // 新しい設備を追加
        for (String typeStr : inputs) {
            try {
                EquipmentType type = EquipmentType.valueOf(typeStr);
                toilet.addEquipment(type);
            } catch (IllegalArgumentException e) {
                // 無効なタイプは無視
            }
        }
    }

    // --- ヘルパー: フラグ同期 (Equipment -> Boolean fields) ---
    private void syncFlagsFromEquipment(Toilet toilet) {
        List<String> names = toilet.getEquipmentNames();
        toilet.setWheelchair(names.contains("WHEELCHAIR"));
        toilet.setDiaper(names.contains("DIAPER"));
        toilet.setOpen24h(names.contains("OPEN_24H"));
    }

    // --- ヘルパー: 文字列リストをEnumリストへ ---
    private List<EquipmentType> convertToEnumList(List<String> inputs) {
        if (inputs == null || inputs.isEmpty()) return null;
        List<EquipmentType> list = new ArrayList<>();
        for (String s : inputs) {
            try {
                list.add(EquipmentType.valueOf(s));
            } catch (IllegalArgumentException e) { /* ignore */ }
        }
        return list.isEmpty() ? null : list;
    }
}