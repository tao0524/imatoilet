package com.imatoilet.backend;

import com.imatoilet.backend.dto.InventoryResponseDto;
import com.imatoilet.backend.dto.MaterialDropDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryService {

    private final UserInventoryRepository inventoryRepository;

    public InventoryService(UserInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * チェックイン時に素材を追加し、新たに解放された装備を返す
     */
    public DropResult processDrop(String userId, String facilityCategory) {
        MaterialItem material = MaterialItem.fromFacilityCategory(facilityCategory);
        if (material == null) {
            return new DropResult(null, List.of());
        }

        // 素材追加前に解放済み装備を記録
        List<UserInventory> inventoryBefore = inventoryRepository.findByUserId(userId);
        Set<EquipmentItem> unlockedBefore = getUnlockedEquipments(inventoryBefore);

        // 素材を+1
        UserInventory inv = inventoryRepository.findByUserIdAndMaterialKey(userId, material.name())
                .orElseGet(() -> {
                    UserInventory newInv = new UserInventory();
                    newInv.setUserId(userId);
                    newInv.setMaterialKey(material.name());
                    newInv.setQuantity(0);
                    return newInv;
                });
        inv.setQuantity(inv.getQuantity() + 1);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);

        // 素材追加後に解放済み装備をチェック
        List<UserInventory> inventoryAfter = inventoryRepository.findByUserId(userId);
        Set<EquipmentItem> unlockedAfter = getUnlockedEquipments(inventoryAfter);

        // 新たに解放された装備 = after - before
        List<EquipmentItem> newlyUnlocked = unlockedAfter.stream()
                .filter(e -> !unlockedBefore.contains(e))
                .toList();

        MaterialDropDto dropDto = new MaterialDropDto(
                material.name(), material.getDisplayName(), material.getEmoji(), inv.getQuantity()
        );

        return new DropResult(dropDto, newlyUnlocked);
    }

    /**
     * インベントリから素材解放装備の解放状態を計算する
     */
    private Set<EquipmentItem> getUnlockedEquipments(List<UserInventory> inventory) {
        Map<String, Integer> quantityMap = inventory.stream()
                .collect(Collectors.toMap(UserInventory::getMaterialKey, UserInventory::getQuantity));

        Set<EquipmentItem> unlocked = new HashSet<>();
        for (EquipmentItem item : EquipmentItem.values()) {
            if (item.getRequiredMaterial() != null) {
                int qty = quantityMap.getOrDefault(item.getRequiredMaterial().name(), 0);
                if (qty >= item.getRequiredMaterialCount()) {
                    unlocked.add(item);
                }
            }
        }
        return unlocked;
    }

    /**
     * ユーザーのインベントリ一覧を取得する（アバター画面の「そざい」タブ用）
     */
    @Transactional(readOnly = true)
    public List<InventoryResponseDto> getInventory(String userId) {
        List<UserInventory> inventory = inventoryRepository.findByUserId(userId);
        Map<String, Integer> quantityMap = inventory.stream()
                .collect(Collectors.toMap(UserInventory::getMaterialKey, UserInventory::getQuantity));

        List<InventoryResponseDto> result = new ArrayList<>();
        for (MaterialItem material : MaterialItem.values()) {
            int qty = quantityMap.getOrDefault(material.name(), 0);
            result.add(new InventoryResponseDto(
                    material.name(), material.getDisplayName(), material.getEmoji(), qty
            ));
        }
        return result;
    }

    public void addMaterial(String userId, String materialKey, int count) {
        UserInventory inv = inventoryRepository.findByUserIdAndMaterialKey(userId, materialKey)
                .orElseGet(() -> {
                    UserInventory newInv = new UserInventory();
                    newInv.setUserId(userId);
                    newInv.setMaterialKey(materialKey);
                    newInv.setQuantity(0);
                    return newInv;
                });
        inv.setQuantity(inv.getQuantity() + count);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
    }

    public void consumeMaterial(String userId, String materialKey, int cost) {
        UserInventory inv = inventoryRepository.findByUserIdAndMaterialKey(userId, materialKey)
                .orElseThrow(() -> new IllegalStateException("素材不足: " + materialKey));
        if (inv.getQuantity() < cost) {
            throw new IllegalStateException(
                    "素材不足: " + materialKey + " (所持: " + inv.getQuantity() + ", 必要: " + cost + ")");
        }
        inv.setQuantity(inv.getQuantity() - cost);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
    }

    @Transactional(readOnly = true)
    public int getQuantity(String userId, String materialKey) {
        return inventoryRepository.findByUserIdAndMaterialKey(userId, materialKey)
                .map(UserInventory::getQuantity)
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getCrystalQuantities(String userId) {
        List<UserInventory> inventory = inventoryRepository.findByUserId(userId);
        Map<String, Integer> quantityMap = inventory.stream()
                .filter(inv -> inv.getMaterialKey().startsWith("crystal_"))
                .collect(Collectors.toMap(UserInventory::getMaterialKey, UserInventory::getQuantity));
        Map<String, Integer> crystals = new HashMap<>();
        for (String key : List.of("crystal_nature", "crystal_steel", "crystal_pure", "crystal_chaos")) {
            crystals.put(key, quantityMap.getOrDefault(key, 0));
        }
        return crystals;
    }

    @Data
    @AllArgsConstructor
    public static class DropResult {
        private MaterialDropDto droppedMaterial;
        private List<EquipmentItem> newlyUnlockedEquipments;
    }
}
