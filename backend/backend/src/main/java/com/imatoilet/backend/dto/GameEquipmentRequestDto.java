package com.imatoilet.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class GameEquipmentRequestDto {

    @NotBlank
    @Pattern(regexp = "NATURE|STEEL|PURE|CHAOS")
    private String weaponAttribute;
}
