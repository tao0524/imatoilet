package com.imatoilet.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class StoryEvolveRequestDto {

    @Min(2)
    @Max(4)
    private int targetTier;
}