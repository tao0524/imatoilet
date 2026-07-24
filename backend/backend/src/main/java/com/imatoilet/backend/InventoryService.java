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

    @Data
    @AllArgsConstructor
    public static class DropResult {
        private MaterialDropDto droppedMaterial;
        private List<EquipmentItem> newlyUnlockedEquipments;
    }
}
