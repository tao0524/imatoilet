package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoryProgressResponseDto {
    private int storyChapter;
    private int storyScene;
}
