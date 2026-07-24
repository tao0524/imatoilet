package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

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
    private boolean isFirstCheckin;
    private List<QuestResultDto> questResults;
    private boolean allQuestsCompleted;
    private int completionBonusExp;
    private boolean isPurified;
    private int raidContributionExp;
    private int raidFinishingBlowExp;
    private List<AchievementResponseDto> newAchievements;
    // Phase2 追加
    private MaterialDropDto droppedMaterial;
    private List<String> newUnlockedEquipments;
}
