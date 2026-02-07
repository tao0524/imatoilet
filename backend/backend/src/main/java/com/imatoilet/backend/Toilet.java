package com.imatoilet.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

// ★追加1：リストを使うためのインポート
import java.util.ArrayList;
import java.util.List;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "toilet")
@Data
public class Toilet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 既存フィールド ---
    
    @NotBlank(message = "名前は必須です")
    @Size(max = 100, message = "名前は100文字以内で入力してください")
    private String name;

    @NotNull(message = "緯度は必須です")
    private Double lat;

    @NotNull(message = "経度は必須です")
    private Double lng;

    private String address;
    private Boolean publicUse;
    private Boolean diaper;
    private Boolean wheelchair;
    private Boolean typePark;
    private Boolean typeStation;
    private Boolean typeMall;

    @Size(max = 500, message = "説明は500文字以内で入力してください")
    private String description;
    
    private Boolean open24h;

    // --- 新設計フィールド ---
    private String facilityCategory;
    private String locationCategory;
    private String equipment; // ※これはCSV用として残します
    private String usageConditions;
    private String atmosphere;

    @Min(value = 1, message = "清潔度は1以上である必要があります")
    @Max(value = 5, message = "清潔度は5以下である必要があります")
    private Integer cleanliness;

    // ★追加: 画像URL (TEXT型に対応)
    @Size(max = 2048, message = "画像URLは2048文字以内で入力してください")
    private String image;

    // ★追加2：equipmentテーブルと繋がるリスト（N+1対策の窓口）
    @OneToMany(mappedBy = "toilet", fetch = FetchType.LAZY)
    @ToString.Exclude           // エラー防止（無限ループ対策）
    @EqualsAndHashCode.Exclude  // エラー防止（無限ループ対策）
    private List<Equipment> equipmentList = new ArrayList<>();

    // --- 互換性メソッド ---
    @PrePersist
    @PreUpdate
    public void syncCompatibility() {
        syncOldToNew();
        syncNewToOld();
    }

    private void syncOldToNew() {
        if (this.facilityCategory == null || this.facilityCategory.isEmpty()) {
            if (Boolean.TRUE.equals(typeStation)) this.facilityCategory = "station";
            else if (Boolean.TRUE.equals(typePark)) this.facilityCategory = "park";
            else if (Boolean.TRUE.equals(typeMall)) this.facilityCategory = "commercial";
        }
        String currentEq = (this.equipment == null) ? "" : this.equipment;
        if (Boolean.TRUE.equals(wheelchair) && !currentEq.contains("wheelchair")) {
            currentEq = addTag(currentEq, "wheelchair");
        }
        if (Boolean.TRUE.equals(diaper) && !currentEq.contains("diaper_table")) {
            currentEq = addTag(currentEq, "diaper_table");
        }
        if (Boolean.TRUE.equals(open24h) && !currentEq.contains("open_24h")) {
            currentEq = addTag(currentEq, "open_24h");
        }
        this.equipment = currentEq;
    }

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

    private String addTag(String current, String tag) {
        if (current == null || current.isEmpty()) {
            return tag;
        }
        return current + "," + tag;
    }
}