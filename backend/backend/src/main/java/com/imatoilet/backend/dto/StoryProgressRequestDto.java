package com.imatoilet.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class StoryProgressRequestDto {

    @Min(0) @Max(6)
    private int chapter;

    @Min(0)
    private int scene;
}
