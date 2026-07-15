package com.imatoilet.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ImportResultDto {
    private int inserted;
    private int skipped;
    private List<String> skippedReasons;
}
