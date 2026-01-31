package com.imatoilet.backend;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist; // 追加
import jakarta.persistence.PreUpdate;  // 追加
import lombok.Data;

@Entity
@Table(name = "toilet")
@Data
public class Toilet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 既存フィールド（後方互換性のため維持） ---
    private String name;
    private Double lat;
    private Double lng;
    private String address;
    private Boolean publicUse;
    private Boolean diaper;
    private Boolean wheelchair;
    private Boolean typePark;
    private Boolean typeStation;
    private Boolean typeMall;
    private String description;
    private Boolean open24h;

    // --- 新設計フィールド（Step A0: 追加済み） ---
    private String facilityCategory; // station, commercial, park, etc.
    private String locationCategory; // downtown, residential, etc.
    private String equipment;        // wheelchair, diaper_table, open_24h, etc. (カンマ区切り)
    private String usageConditions;  // staff_required, customer_only, etc.
    private String atmosphere;       // clean, bright, etc.

    // --- Step A1: 互換レイヤー（自動同期ロジック） ---
    
    @PrePersist
    @PreUpdate
    public void syncCompatibility() {
        syncOldToNew();
        syncNewToOld();
    }

    // 旧仕様の入力 → 新フィールドへ反映
    private void syncOldToNew() {
        // 1. 施設カテゴリの変換
        // (まだ新カテゴリが空の場合のみ、旧フラグから推測して埋める)
        if (this.facilityCategory == null || this.facilityCategory.isEmpty()) {
            if (Boolean.TRUE.equals(typeStation)) this.facilityCategory = "station";
            else if (Boolean.TRUE.equals(typePark)) this.facilityCategory = "park";
            else if (Boolean.TRUE.equals(typeMall)) this.facilityCategory = "commercial";
        }

        // 2. 設備の変換（カンマ区切り文字列として構築）
        // 現在の equipment 文字列を取得（nullなら空文字）
        String currentEq = (this.equipment == null) ? "" : this.equipment;

        // "wheelchair" フラグがあれば、文字列に追加
        if (Boolean.TRUE.equals(wheelchair) && !currentEq.contains("wheelchair")) {
            currentEq = addTag(currentEq, "wheelchair");
        }
        // "diaper" フラグがあれば、文字列に追加
        if (Boolean.TRUE.equals(diaper) && !currentEq.contains("diaper_table")) {
            currentEq = addTag(currentEq, "diaper_table");
        }
        // "open24h" フラグがあれば、文字列に追加
        if (Boolean.TRUE.equals(open24h) && !currentEq.contains("open_24h")) {
            currentEq = addTag(currentEq, "open_24h");
        }
        
        this.equipment = currentEq;
    }

    // 新仕様の入力 → 旧フラグへ反映（逆変換）
    private void syncNewToOld() {
        if (this.facilityCategory != null) {
            if (this.facilityCategory.equals("station")) this.typeStation = true;
            else if (this.facilityCategory.equals("park")) this.typePark = true;
            else if (this.facilityCategory.equals("commercial")) this.typeMall = true;
        }

        if (this.equipment != null) {
            if (this.equipment.contains("wheelchair")) this.wheelchair = true;
            if (this.equipment.contains("diaper_table")) this.diaper = true;
            if (this.equipment.contains("open_24h")) this.open24h = true;
        }
    }

    // ユーティリティ: カンマ区切りでタグを追加
    private String addTag(String current, String tag) {
        if (current == null || current.isEmpty()) {
            return tag;
        }
        return current + "," + tag;
    }
}