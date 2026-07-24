package com.imatoilet.backend;

public enum MaterialItem {

    PARK_LEAF("park", "こうえんのはっぱ", "\uD83C\uDF43"),
    HOTEL_TOWEL("hotel_tourism", "ホテルのタオル", "\uD83E\uDDFB"),
    OTHER_JUNK("other", "なぞのガラクタ", "\u2699\uFE0F"),
    PUBLIC_MEDAL("public", "まちのメダル", "\uD83E\uDE99"),
    CONVENIENCE_RECEIPT("convenience", "コンビニのレシート", "\uD83E\uDDFE"),
    MEDICAL_BANDAGE("medical", "きれいなバンソウコウ", "\uD83E\uDE79"),
    STATION_TICKET("station", "えきのきっぷ", "\uD83C\uDFAB"),
    COMMERCIAL_STAMP("commercial", "おかいものスタンプ", "\uD83D\uDECD\uFE0F");

    private final String facilityCategory;
    private final String displayName;
    private final String emoji;

    MaterialItem(String facilityCategory, String displayName, String emoji) {
        this.facilityCategory = facilityCategory;
        this.displayName = displayName;
        this.emoji = emoji;
    }

    public String getFacilityCategory() { return facilityCategory; }
    public String getDisplayName() { return displayName; }
    public String getEmoji() { return emoji; }

    public static MaterialItem fromFacilityCategory(String category) {
        if (category == null) return null;
        for (MaterialItem item : values()) {
            if (item.facilityCategory.equals(category)) {
                return item;
            }
        }
        return null;
    }
}
