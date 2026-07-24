package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventoryResponseDto {
    private String materialKey;
    private String displayName;
    private String emoji;
    private int quantity;
}
