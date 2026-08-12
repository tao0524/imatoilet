package com.imatoilet.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ItemUseRequestDto {
    @NotBlank
    private String itemKey;
}
