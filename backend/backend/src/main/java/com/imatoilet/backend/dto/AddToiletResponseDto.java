package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddToiletResponseDto {
    private Long id;
    private String name;
    private Double lat;
    private Double lng;
    private boolean duplicateWarning;
}
