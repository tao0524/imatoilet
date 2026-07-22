package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Entity
@Table(name = "toilet_reports")
@Data
public class ToiletReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "toilet_id", nullable = false)
    private Long toiletId;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "category", nullable = false, length = 30)
    private String category;

    @Column(name = "comment")
    private String comment;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;
}
