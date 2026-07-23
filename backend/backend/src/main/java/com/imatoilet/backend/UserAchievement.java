package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_achievements",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "achievement_key"}))
@Data
@NoArgsConstructor
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "achievement_key", nullable = false, length = 50)
    private AchievementType achievementKey;

    @Column(name = "unlocked_at", nullable = false)
    private OffsetDateTime unlockedAt;

    @PrePersist
    protected void onCreate() {
        this.unlockedAt = OffsetDateTime.now();
    }

    public UserAchievement(String userId, AchievementType achievementKey) {
        this.userId = userId;
        this.achievementKey = achievementKey;
    }
}
