package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class DailyQuestResponseDto {

    private LocalDate questDate;
    private List<QuestSlotDto> quests;
    private int completedCount;
    private boolean allCompleted;
    private boolean bonusEarned;

    @Data
    @AllArgsConstructor
    public static class QuestSlotDto {
        private int slot;
        private String questType;
        private String title;
        private String description;
        private boolean completed;
        private String completedAt;
    }
}
