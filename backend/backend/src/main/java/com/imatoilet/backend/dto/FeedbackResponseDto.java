package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeedbackResponseDto {
    private boolean success;
    private Double trustScore;
    private Integer feedbackCount;
    private Integer earnedExp;
    private Integer totalExp;
    private Integer userLevel;
    private Integer contributionCount;
}
