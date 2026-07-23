package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AchievementResponseDto {
    private String key;
    private String displayName;
    private String description;
    private String icon;
}
