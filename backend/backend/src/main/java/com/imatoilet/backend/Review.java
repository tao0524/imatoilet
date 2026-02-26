package com.imatoilet.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Data
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // トイレとのリレーション (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toilet_id", nullable = false)
    @JsonIgnore             // 親(Toilet)に戻らない（JSON無限ループ防止）
    @ToString.Exclude       // Lombokの無限ループ防止
    @EqualsAndHashCode.Exclude
    private Toilet toilet;

    @Size(max = 100, message = "ニックネームは100文字以内で入力してください")
    private String nickname;

    @NotNull(message = "評価は必須です")
    @Min(value = 1, message = "評価は1以上である必要があります")
    @Max(value = 5, message = "評価は5以下である必要があります")
    private Integer rating;

    @Size(max = 1000, message = "コメントは1000文字以内で入力してください")
    private String comment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 登録時に自動で現在時刻をセットする
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}