package com.imatoilet.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ReportToiletRequestDto {
    @NotBlank(message = "カテゴリは必須です")
    @Pattern(
        regexp = "^(NOT_EXIST|INAPPROPRIATE|DANGEROUS|DUPLICATE)$",
        message = "カテゴリの値が不正です"
    )
    private String category;

    @Size(max = 500, message = "コメントは500文字以内で入力してください")
    private String comment;

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
