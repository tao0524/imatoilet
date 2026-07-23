package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @Column(length = 128)
    private String id;

    @Column(length = 50)
    private String nickname;

    @Column(name = "total_exp", nullable = false)
    private Integer totalExp = 0;

    @Column(nullable = false)
    private Integer level = 1;

    @Column(name = "contribution_count", nullable = false)
    private Integer contributionCount = 0;

    @Column(name = "equipped_head", length = 50)
    private String equippedHead = "TRAVELERS_HAT";

    @Column(name = "equipped_right_hand", length = 50)
    private String equippedRightHand = "WOODEN_STICK";

    @Column(name = "equipped_aura", length = 50)
    private String equippedAura = "NONE";

    @Column(name = "active_title", length = 50)
    private String activeTitle;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
