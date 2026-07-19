package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "toilet_feedback")
@Data
@NoArgsConstructor
public class ToiletFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "toilet_id", nullable = false)
    private Long toiletId;

    @Column(nullable = false, length = 20)
    private String feeling;

    @Column(name = "issue_tags", length = 200)
    private String issueTags;

    @Column(name = "user_level")
    private Integer userLevel;

    @Column(name = "user_id", length = 128)
    private String userId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}