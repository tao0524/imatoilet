package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExternalImportItemResultDto {
    private int inputIndex;
    private String sourceKey;
    private String sourceExternalId;
    private ExternalImportStatus status;
    private Long existingToiletId;
    private Double distanceMeters;
    private String message;
}
