package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "daily_quests")
@Data
@NoArgsConstructor
public class DailyQuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quest_date", nullable = false, unique = true)
    private LocalDate questDate;

    @Column(name = "quest_type_1", nullable = false, length = 30)
    private String questType1;

    @Column(name = "quest_type_2", nullable = false, length = 30)
    private String questType2;

    @Column(name = "quest_type_3", nullable = false, length = 30)
    private String questType3;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
}
