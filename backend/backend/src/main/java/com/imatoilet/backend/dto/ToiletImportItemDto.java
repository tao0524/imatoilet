package com.imatoilet.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ToiletImportItemDto {
    private String name;
    private Double lat;
    private Double lng;
    private String address;
    private Boolean publicUse;
    private String facilityCategory;
    private String source;
    private String sourceUrl;
    private LocalDate lastVerified;
    private List<String> equipment;
}
