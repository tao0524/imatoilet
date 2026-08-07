package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GameDataResponseDto {
    private int battleLevel;
    private int battleExp;
    private int expToNextLevel;
    private String weaponAttribute;
    private int weaponTier;
    private int weaponEnhancement;
    private int armorTier;
    private int armorEnhancement;
    private int auraTier;
    private int auraEnhancement;
    private long totalWins;
    private long totalBattles;
    private int storyChapter;
    private int storyScene;
}
