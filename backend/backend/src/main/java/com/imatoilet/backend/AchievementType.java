package com.imatoilet.backend;

/**
 * 称号（バッジ）定義。
 * 条件判定は AchievementService で行う。
 * ここでは表示名・説明・アイコン絵文字を管理する。
 */
public enum AchievementType {

    // --- 基本マイルストーン ---
    FIRST_ADVENTURE(
        "はじめての冒険者",
        "初めてのちょうさを完了した",
        "🐣"
    ),
    SEASONED_EXPLORER(
        "慣れた探検家",
        "累計10回ちょうさを完了した",
        "🗺️"
    ),
    VETERAN_ADVENTURER(
        "歴戦の冒険者",
        "累計30回ちょうさを完了した",
        "⚔️"
    ),

    // --- 施設カテゴリ別 ---
    CONVENIENCE_EXPLORER(
        "コンビニ探検家",
        "コンビニのトイレを5回ちょうさした",
        "🏪"
    ),
    PARK_MASTER(
        "公園マスター",
        "公園のトイレを5回ちょうさした",
        "🌳"
    ),
    STATION_RANGER(
        "駅のレンジャー",
        "駅のトイレを5回ちょうさした",
        "🚉"
    ),
    MALL_NAVIGATOR(
        "商業施設のナビゲーター",
        "商業施設のトイレを5回ちょうさした",
        "🛒"
    ),

    // --- 探索系 ---
    WIDE_TRAVELER(
        "広域の旅人",
        "10箇所の異なるトイレをちょうさした",
        "🧭"
    ),
    CARTOGRAPHER(
        "地図職人",
        "25箇所の異なるトイレをちょうさした",
        "🗺️"
    ),

    // --- 浄化系 ---
    PURIFIER(
        "浄化の勇者",
        "へいわど40未満のトイレを3回ちょうさした",
        "✨"
    );

    private final String displayName;
    private final String description;
    private final String icon;

    AchievementType(String displayName, String description, String icon) {
        this.displayName = displayName;
        this.description = description;
        this.icon = icon;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }
}
