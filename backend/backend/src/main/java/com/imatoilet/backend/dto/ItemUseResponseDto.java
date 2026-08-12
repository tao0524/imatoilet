package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ItemUseResponseDto {
    private String itemKey;
    private int newQuantity;
}
