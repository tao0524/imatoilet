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

    @Column(name = "battle_level")
    private Integer battleLevel = 1;

    @Column(name = "battle_exp")
    private Integer battleExp = 0;

    @Column(name = "weapon_attribute", length = 20)
    private String weaponAttribute = "NATURE";

    @Column(name = "weapon_tier")
    private Integer weaponTier = 1;

    @Column(name = "weapon_enhancement")
    private Integer weaponEnhancement = 0;

    @Column(name = "armor_tier")
    private Integer armorTier = 1;

    @Column(name = "armor_enhancement")
    private Integer armorEnhancement = 0;

    @Column(name = "aura_tier")
    private Integer auraTier = 1;

    @Column(name = "aura_enhancement")
    private Integer auraEnhancement = 0;

    @Column(name = "story_chapter")
    private Integer storyChapter = 0;

    @Column(name = "story_scene")
    private Integer storyScene = 0;

    @Column(name = "held_door_enemy_id")
    private String heldDoorEnemyId;

    @Column(name = "purify_stone", nullable = false)
    private int purifyStone = 0;

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
