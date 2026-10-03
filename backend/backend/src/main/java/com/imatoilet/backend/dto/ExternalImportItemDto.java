package com.imatoilet.backend.dto;

import com.imatoilet.backend.EquipmentType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ExternalImportItemDto {
    @Size(max = 100)
    private String name;

    @NotNull(message = "緯度は必須です")
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double lat;

    @NotNull(message = "経度は必須です")
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double lng;

    @Size(max = 200)
    private String address;

    @Size(max = 500)
    private String description;

    private Boolean publicUse;

    @Pattern(regexp = "^(station|commercial|convenience|park|public|medical|hotel_tourism|other)?$",
             message = "施設カテゴリの値が不正です")
    private String facilityCategory;

    @Size(max = 100)
    private String source;

    @Size(max = 2048)
    private String sourceUrl;

    private LocalDate lastVerified;

    @NotBlank(message = "sourceKeyは必須です")
    @Size(max = 100)
    @Pattern(regexp = "^osm$", message = "sourceKeyは現在osmのみ指定できます")
    private String sourceKey;

    @NotBlank(message = "sourceExternalIdは必須です")
    @Size(max = 255)
    @Pattern(regexp = "^(node|way|relation)/[1-9][0-9]*$",
             message = "OSM sourceExternalIdはnode/123、way/123、relation/123の正規形で指定してください")
    private String sourceExternalId;

    private boolean allowNearbyDistinct;

    private List<@NotBlank(message = "equipment名は空にできません") String> equipment;

    @AssertTrue(message = "equipmentに不明な値が含まれています")
    public boolean isEquipmentValid() {
        if (equipment == null) {
            return true;
        }
        return equipment.stream().allMatch(value -> {
            try {
                EquipmentType.valueOf(value);
                return true;
            } catch (IllegalArgumentException | NullPointerException ex) {
                return false;
            }
        });
    }

    @AssertTrue(message = "OSM sourceUrlはHTTPSの正規URLで、sourceExternalIdと一致させてください")
    public boolean isSourceUrlConsistent() {
        if (sourceUrl == null) {
            return true;
        }
        return sourceExternalId != null
                && sourceUrl.equals("https://www.openstreetmap.org/" + sourceExternalId);
    }
}
