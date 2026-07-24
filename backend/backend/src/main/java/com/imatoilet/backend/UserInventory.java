package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_inventory")
@IdClass(UserInventoryId.class)
@Data
public class UserInventory {

    @Id
    @Column(name = "user_id", length = 128)
    private String userId;

    @Id
    @Column(name = "material_key", length = 50)
    private String materialKey;

    @Column(name = "quantity", nullable = false)
    private int quantity = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
