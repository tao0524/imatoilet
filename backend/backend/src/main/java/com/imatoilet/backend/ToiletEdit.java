package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Entity
@Table(name = "toilet_edits")
@Data
public class ToiletEdit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "toilet_id", nullable = false)
    private Long toiletId;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
