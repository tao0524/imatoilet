package com.imatoilet.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "toilet")
@Data
public class Toilet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    // --- 旧フラグ完全廃止 ---
    private Boolean publicUse;
    private Boolean typePark;
    private Boolean typeStation;
    private Boolean typeMall;

    @Size(max = 500, message = "説明は500文字以内で入力してください")
    private String description;
    
    @Pattern(
        regexp = "^(station|commercial|convenience|park|public|medical|hotel_tourism|other)?$",
        message = "施設カテゴリの値が不正です"
    )
    private String facilityCategory;
    
    private String locationCategory;
    private String usageConditions;
    private String atmosphere;

    @Min(value = 1, message = "清潔度は1以上である必要があります")
    @Max(value = 5, message = "清潔度は5以下である必要があります")
    private Integer cleanliness;

    @Size(max = 2048, message = "画像URLは2048文字以内で入力してください")
    @Pattern(regexp = "^(https?://[^,]+(,https?://[^,]+)*)?$", message = "画像URLの形式が不正です")
    private String image;

    @Size(max = 100, message = "出典は100文字以内で入力してください")
    private String source;

    @Size(max = 2048, message = "出典URLは2048文字以内で入力してください")
    private String sourceUrl;

    private LocalDate lastVerified;

    @Column(name = "trust_score")
    private Double trustScore;

    @Column(name = "feedback_count")
    private Integer feedbackCount = 0;

    @Column(name = "created_by", length = 128)
    private String createdBy;
    
    @OneToMany(mappedBy = "toilet", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Equipment> equipmentList = new ArrayList<>();

    @OneToMany(mappedBy = "toilet", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Review> reviews = new ArrayList<>();

    @JsonProperty(value = "equipment", access = JsonProperty.Access.READ_ONLY)
    public List<String> getEquipmentNames() {
        if (equipmentList == null) return new ArrayList<>();
        return equipmentList.stream()
                .map(e -> e.getType().name())
                .collect(Collectors.toList());
    }

    @Transient
    @JsonProperty(value = "equipment", access = JsonProperty.Access.WRITE_ONLY)
    private List<String> equipmentInput;

    public void addEquipment(EquipmentType type) {
        Equipment equipment = new Equipment(this, type);
        equipmentList.add(equipment);
    }
}