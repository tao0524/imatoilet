package com.imatoilet.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "toilet")
@Data
public class Toilet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 基本フィールド ---
    
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

    @Size(max = 200, message = "住所は200文字以内で入力してください")
    private String address;

    // --- フラグ（互換性のため維持するが、本来はequipmentList推奨） ---
    private Boolean publicUse;
    private Boolean diaper;
    private Boolean wheelchair;
    private Boolean typePark;
    private Boolean typeStation;
    private Boolean typeMall;

    @Size(max = 500, message = "説明は500文字以内で入力してください")
    private String description;
    
    private Boolean open24h;

    // --- カテゴリ ---
    @Pattern(
        regexp = "^(station|commercial|convenience|park|public|medical|hotel_tourism|other)?$",
        message = "施設カテゴリの値が不正です"
    )
    private String facilityCategory;
    
    private String locationCategory;
    
    // --- 削除: CSV用 String equipment ---
    
    private String usageConditions;
    private String atmosphere;

    @Min(value = 1, message = "清潔度は1以上である必要があります")
    @Max(value = 5, message = "清潔度は5以下である必要があります")
    private Integer cleanliness;

    @Size(max = 2048, message = "画像URLは2048文字以内で入力してください")
    @Pattern(regexp = "^(https?://[^,]+(,https?://[^,]+)*)?$", message = "画像URLの形式が不正です")
    private String image;

    // --- Equipment リレーション ---
    // DB上のリレーション管理用（JSONには直接出さない）
    @OneToMany(mappedBy = "toilet", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Equipment> equipmentList = new ArrayList<>();

    // --- JSON 入出力用 ---

    // 1. APIレスポンス用 (JSON: "equipment": ["wheelchair", "open_24h"])
    @JsonProperty("equipment")
    public List<String> getEquipmentNames() {
        if (equipmentList == null) return new ArrayList<>();
        return equipmentList.stream()
                .map(e -> e.getType().name()) // Enum名を返す
                .collect(Collectors.toList());
    }

    // 2. APIリクエスト受信用
    @Transient
    @JsonProperty("equipment")
    private List<String> equipmentInput;

    // --- ヘルパーメソッド ---
    
    public void addEquipment(EquipmentType type) {
        Equipment equipment = new Equipment(this, type);
        equipmentList.add(equipment);
    }
}