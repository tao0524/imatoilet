package com.imatoilet.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class AddToiletRequestDto {
    @NotBlank(message = "名前は必須です")
    @Size(max = 100)
    private String name;

    @NotNull(message = "緯度は必須です")
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double lat;

    @NotNull(message = "経度は必須です")
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double lng;

    @Pattern(regexp = "^(station|commercial|convenience|park|public|medical|hotel_tourism|other)?$")
    private String facilityCategory;

    @Pattern(regexp = "^(PUBLIC_FREE|FACILITY_FREE|PURCHASE_REQUIRED)?$")
    private String usageConditions;

    @Size(max = 500)
    private String description;

    private List<String> equipment;
}
