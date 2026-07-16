package com.imatoilet.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackRequestDto {
    @NotBlank(message = "感情の選択は必須です")
    private String feeling;
    
    private String issueTags;
    private Integer userLevel;
}