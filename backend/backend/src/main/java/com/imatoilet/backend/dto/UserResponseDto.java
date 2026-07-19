package com.imatoilet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponseDto {
    private Integer totalExp;
    private Integer level;
    private Integer contributionCount;
    private String nickname;
}
