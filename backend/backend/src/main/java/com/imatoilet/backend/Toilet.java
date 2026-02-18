package com.imatoilet.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @DecimalMin(value = "-90.0", message = "緯度は-90以上である必要があります")
    @DecimalMax(value = "90.0", message = "緯度は90以下である必要があります")
    private Double lat;

    @NotNull(message = "経度は必須です")
    @DecimalMin(value = "-180.0", message = "経度は-180以上である必要があります")
    @DecimalMax(value = "180.0", message = "経度は180以下である必要があります")
    private Double lng;

    // 修正4: バリデーション追加
    @Size(max = 200, message = "住所は200文字以内で入力してください")
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
    // 修正4: バリデーション追加
    @Pattern(
        regexp = "^(station|commercial|convenience|park|public|medical|hotel_tourism|other)?$",
        message = "施設カテゴリの値が不正です"
    )
    private String facilityCategory;
    
    private String locationCategory;
    
    // 修正4: バリデーション追加
    /**
     * フロントエンド互換用のCSV文字列（例: "wheelchair,diaper,open_24h"）。
     * 正規化された設備データは equipmentList（equipment テーブル）を参照すること。
     * TODO: 将来的にこのフィールドを廃止し、equipmentList に一本化する。
     */
    @Size(max = 500, message = "設備情報は500文字以内で入力してください")
    @Pattern(
        regexp = "^([a-z_0-9]+(,[a-z_0-9]+)*)?$",
        message = "設備情報の形式が不正です"
    )
    private String equipment;
    
    private String usageConditions;
    private String atmosphere;

    @Min(value = 1, message = "清潔度は1以上である必要があります")
    @Max(value = 5, message = "清潔度は5以下である必要があります")
    private Integer cleanliness;

    @Size(max = 2048, message = "画像URLは2048文字以内で入力してください")
    @Pattern(regexp = "^(https?://[^,]+(,https?://[^,]+)*)?$", message = "画像URLの形式が不正です")
    private String image;

    @OneToMany(mappedBy = "toilet", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
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
        if (Boolean.TRUE.equals(diaper) && !currentEq.contains("diaper")) {
            currentEq = addTag(currentEq, "diaper");
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
            if (this.equipment.contains("diaper")) this.diaper = true;
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