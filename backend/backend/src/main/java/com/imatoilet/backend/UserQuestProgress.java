package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_quest_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "quest_date", "slot"}))
@Data
@NoArgsConstructor
public class UserQuestProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "quest_date", nullable = false)
    private LocalDate questDate;

    @Column(nullable = false)
    private Integer slot;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
