package com.imatoilet.backend;

public enum EquipmentItem {

    // === レベル解放装備（既存） ===

    // HEAD
    TRAVELERS_HAT(EquipmentSlot.HEAD, 1, "旅人の帽子"),
    LEATHER_HELM(EquipmentSlot.HEAD, 2, "革のヘルム"),
    IRON_HELMET(EquipmentSlot.HEAD, 3, "鉄のかぶと"),
    GOLDEN_HELMET(EquipmentSlot.HEAD, 4, "金のかぶと"),
    LEGENDARY_CROWN(EquipmentSlot.HEAD, 5, "伝説の王冠"),

    // RIGHT_HAND
    WOODEN_STICK(EquipmentSlot.RIGHT_HAND, 1, "木の棒"),
    CYPRESS_SWORD(EquipmentSlot.RIGHT_HAND, 2, "ひのきの剣"),
    STEEL_SWORD(EquipmentSlot.RIGHT_HAND, 3, "鋼の剣"),
    FLAME_SWORD(EquipmentSlot.RIGHT_HAND, 4, "炎の剣"),
    HOLY_STAFF(EquipmentSlot.RIGHT_HAND, 5, "聖なる杖"),

    // AURA
    NONE(EquipmentSlot.AURA, 1, "なし"),
    FAINT_GLOW(EquipmentSlot.AURA, 2, "薄い光"),
    BLUE_RADIANCE(EquipmentSlot.AURA, 3, "青い輝き"),
    GOLDEN_AURA(EquipmentSlot.AURA, 4, "金のオーラ"),
    RAINBOW_AURA(EquipmentSlot.AURA, 5, "虹色のオーラ"),

    // === 素材解放装備（Phase2 新規） ===

    // HEAD（素材）
    LEAF_HAT(EquipmentSlot.HEAD, "はっぱのぼうし", MaterialItem.PARK_LEAF, 5),
    TOWEL_HOOD(EquipmentSlot.HEAD, "タオルのずきん", MaterialItem.HOTEL_TOWEL, 3),
    JUNK_CROWN(EquipmentSlot.HEAD, "ガラクタのかんむり", MaterialItem.OTHER_JUNK, 3),

    // RIGHT_HAND（素材）
    MEDAL_SHIELD(EquipmentSlot.RIGHT_HAND, "メダルのたて", MaterialItem.PUBLIC_MEDAL, 3),
    RECEIPT_SWORD(EquipmentSlot.RIGHT_HAND, "レシートのけん", MaterialItem.CONVENIENCE_RECEIPT, 5),
    BANDAGE_SHIELD(EquipmentSlot.RIGHT_HAND, "バンソウコウのたて", MaterialItem.MEDICAL_BANDAGE, 3),

    // AURA（素材）
    TICKET_AURA(EquipmentSlot.AURA, "きっぷのオーラ", MaterialItem.STATION_TICKET, 5),
    SHOPPING_AURA(EquipmentSlot.AURA, "おかいものオーラ", MaterialItem.COMMERCIAL_STAMP, 5);

    private final EquipmentSlot slot;
    private final int requiredLevel;
    private final String displayName;
    private final MaterialItem requiredMaterial;
    private final int requiredMaterialCount;

    // レベル解放装備用コンストラクタ
    EquipmentItem(EquipmentSlot slot, int requiredLevel, String displayName) {
        this(slot, requiredLevel, displayName, null, 0);
    }

    // 素材解放装備用コンストラクタ
    EquipmentItem(EquipmentSlot slot, String displayName, MaterialItem requiredMaterial, int requiredMaterialCount) {
        this(slot, 0, displayName, requiredMaterial, requiredMaterialCount);
    }

    // 全フィールドコンストラクタ
    EquipmentItem(EquipmentSlot slot, int requiredLevel, String displayName,
                  MaterialItem requiredMaterial, int requiredMaterialCount) {
        this.slot = slot;
        this.requiredLevel = requiredLevel;
        this.displayName = displayName;
        this.requiredMaterial = requiredMaterial;
        this.requiredMaterialCount = requiredMaterialCount;
    }

    public EquipmentSlot getSlot() { return slot; }
    public int getRequiredLevel() { return requiredLevel; }
    public String getDisplayName() { return displayName; }
    public MaterialItem getRequiredMaterial() { return requiredMaterial; }
    public int getRequiredMaterialCount() { return requiredMaterialCount; }

    public static EquipmentItem fromName(String name) {
        if (name == null) return null;
        try {
            return EquipmentItem.valueOf(name);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
