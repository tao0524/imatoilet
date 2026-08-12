package com.imatoilet.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ItemCraftRequestDto {
    @NotBlank
    private String itemKey;
    @NotBlank
    private String crystalAttribute;
    @Min(1)
    private int count;
}
