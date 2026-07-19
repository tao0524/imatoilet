package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuestResultDto {
    private int slot;
    private String questType;
    private String title;
    private boolean justCompleted;
    private int questExp;
}
