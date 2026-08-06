package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "battle_results")
@Data
@NoArgsConstructor
public class BattleResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "enemy_id", nullable = false, length = 50)
    private String enemyId;

    @Column(name = "enemy_star", nullable = false)
    private int enemyStar = 1;

    @Column(nullable = false, length = 10)
    private String result;

    @Column(name = "exp_gained")
    private int expGained;

    @Column(name = "crystal_attribute", length = 20)
    private String crystalAttribute;

    @Column(name = "crystal_count")
    private int crystalCount;

    @Column(name = "toilet_id")
    private Long toiletId;

    @Column(name = "fought_at")
    private LocalDateTime foughtAt;

    @PrePersist
    protected void onCreate() {
        this.foughtAt = LocalDateTime.now();
    }
}
