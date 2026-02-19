package com.imatoilet.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

/**
 * トイレ情報更新用DTO
 * 部分更新に対応するため、全てのフィールドにおける必須チェック(@NotNull, @NotBlank)を排除しています。
 * ただし、値が送信された場合の形式チェック(@Size, @Pattern等)は維持します。
 */
@Data
public class ToiletUpdateDto {

    @Size(max = 100, message = "名前は100文字以内で入力してください")
    private String name;

    @DecimalMin(value = "-90.0", message = "緯度は-90以上である必要があります")
    @DecimalMax(value = "90.0", message = "緯度は90以下である必要があります")
    private Double lat;

    @DecimalMin(value = "-180.0", message = "経度は-180以上である必要があります")
    @DecimalMax(value = "180.0", message = "経度は180以下である必要があります")
    private Double lng;

    @Size(max = 200, message = "住所は200文字以内で入力してください")
    private String address;

    @Size(max = 500, message = "説明は500文字以内で入力してください")
    private String description;

    @Min(value = 1, message = "清潔度は1以上である必要があります")
    @Max(value = 5, message = "清潔度は5以下である必要があります")
    private Integer cleanliness;

    @Size(max = 2048, message = "画像URLは2048文字以内で入力してください")
    @Pattern(regexp = "^(https?://[^,]+(,https?://[^,]+)*)?$", message = "画像URLの形式が不正です")
    private String image;

    @Pattern(
        regexp = "^(station|commercial|convenience|park|public|medical|hotel_tourism|other)?$",
        message = "施設カテゴリの値が不正です"
    )
    private String facilityCategory;

    // --- 設備情報 (JSONの "equipment" キーを受け取る) ---
    // Toilet.javaと同様の問題を避けるため、念のためJsonAliasを使用しますが
    // フィールド名が equipment であれば標準マッピングでも動作します
    @JsonAlias("equipment")
    private List<String> equipment;

    // --- 互換性フラグ (将来的に廃止推奨だが、現状のAPI互換性維持のため残す) ---
    private Boolean publicUse;
    private Boolean diaper;
    private Boolean wheelchair;
    private Boolean open24h;
    private Boolean typePark;
    private Boolean typeStation;
    private Boolean typeMall;
}