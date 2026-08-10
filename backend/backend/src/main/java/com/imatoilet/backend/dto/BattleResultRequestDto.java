package com.imatoilet.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BattleResultRequestDto {

    @NotBlank
    private String enemyId;

    @Min(1) @Max(4)
    private int enemyStar;

    @NotBlank
    @Pattern(regexp = "WIN|LOSE|FLEE")
    private String result;

    private int expGained;

    private String crystalAttribute;

    private int crystalCount;

    private Long toiletId;
}
