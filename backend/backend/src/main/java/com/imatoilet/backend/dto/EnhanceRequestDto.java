package com.imatoilet.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnhanceRequestDto {

    @NotBlank
    private String targetSlot;

    @NotBlank
    private String consumedCrystalAttribute;
}
