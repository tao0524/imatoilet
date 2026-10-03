package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ExternalImportResponseDto {
    private boolean dryRun;
    private List<ExternalImportItemResultDto> results;
}
