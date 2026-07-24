package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MaterialDropDto {
    private String materialKey;
    private String displayName;
    private String emoji;
    private int newQuantity;
}
