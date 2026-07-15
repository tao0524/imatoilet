package com.imatoilet.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ToiletImportRequestDto {
    private List<ToiletImportItemDto> toilets;
}
