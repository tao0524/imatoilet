package com.imatoilet.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EvolveRequestDto {

    @NotBlank
    private String targetSlot;

    @NotBlank
    private String consumedCrystalAttribute;
}
