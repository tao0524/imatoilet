package com.imatoilet.backend;

public enum EquipmentItem {

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
    RAINBOW_AURA(EquipmentSlot.AURA, 5, "虹色のオーラ");

    private final EquipmentSlot slot;
    private final int requiredLevel;
    private final String displayName;

    EquipmentItem(EquipmentSlot slot, int requiredLevel, String displayName) {
        this.slot = slot;
        this.requiredLevel = requiredLevel;
        this.displayName = displayName;
    }

    public EquipmentSlot getSlot() { return slot; }
    public int getRequiredLevel() { return requiredLevel; }
    public String getDisplayName() { return displayName; }

    public static EquipmentItem fromName(String name) {
        if (name == null) return null;
        try {
            return EquipmentItem.valueOf(name);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
