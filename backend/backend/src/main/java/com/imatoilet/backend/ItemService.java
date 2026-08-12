package com.imatoilet.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
public class ItemService {

    @Autowired
    private InventoryService inventoryService;

    // レシピ定義
    private static final Map<String, Integer> RECIPE_COST = Map.of(
        "item_clean_water", 2,
        "item_purify_drop", 4,
        "item_holy_spring", 8
    );

    private static final Map<String, Integer> MAX_STOCK = Map.of(
        "item_clean_water", 10,
        "item_purify_drop", 5,
        "item_holy_spring", 3,
        "item_megami_drop", 1
    );

    private static final Set<String> VALID_CRYSTAL_KEYS = Set.of(
        "crystal_nature", "crystal_steel", "crystal_pure", "crystal_chaos"
    );

    public void craft(String uid, String itemKey, String crystalAttribute, int count) {
        // 1. バリデーション
        if (!RECIPE_COST.containsKey(itemKey)) {
            throw new IllegalArgumentException("このアイテムは調合できません: " + itemKey);
        }
        if (!VALID_CRYSTAL_KEYS.contains(crystalAttribute)) {
            throw new IllegalArgumentException("無効な結晶属性: " + crystalAttribute);
        }
        if (count < 1) {
            throw new IllegalArgumentException("調合数は1以上");
        }

        int costPerItem = RECIPE_COST.get(itemKey);
        int totalCost = costPerItem * count;
        int maxStock = MAX_STOCK.get(itemKey);

        // 2. 結晶残高チェック
        int crystalQty = inventoryService.getQuantity(uid, crystalAttribute);
        if (crystalQty < totalCost) {
            throw new IllegalArgumentException(
                "結晶が足りません（必要: " + totalCost + ", 所持: " + crystalQty + "）"
            );
        }

        // 3. 所持上限チェック
        int currentStock = inventoryService.getQuantity(uid, itemKey);
        if (currentStock + count > maxStock) {
            throw new IllegalArgumentException(
                "所持上限を超えます（上限: " + maxStock + ", 現在: " + currentStock + "）"
            );
        }

        // 4. 実行
        inventoryService.consumeMaterial(uid, crystalAttribute, totalCost);
        inventoryService.addMaterial(uid, itemKey, count);
    }

    public int use(String uid, String itemKey) {
        if (!MAX_STOCK.containsKey(itemKey)) {
            throw new IllegalArgumentException("無効なアイテム: " + itemKey);
        }
        int currentQty = inventoryService.getQuantity(uid, itemKey);
        if (currentQty < 1) {
            throw new IllegalArgumentException("アイテムが足りません: " + itemKey);
        }
        inventoryService.consumeMaterial(uid, itemKey, 1);
        return currentQty - 1;
    }

    public Map<String, Integer> getItemQuantities(String uid) {
        Map<String, Integer> result = new LinkedHashMap<>();
        for (String key : MAX_STOCK.keySet()) {
            result.put(key, inventoryService.getQuantity(uid, key));
        }
        return result;
    }
}
