package com.imatoilet.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequestDto {

    @Size(max = 100, message = "ニックネームは100文字以内で入力してください")
    private String nickname;

    @NotNull(message = "評価は必須です")
    @Min(value = 1, message = "評価は1以上である必要があります")
    @Max(value = 5, message = "評価は5以下である必要があります")
    private Integer rating;

    @Size(max = 1000, message = "コメントは1000文字以内で入力してください")
    private String comment;
}