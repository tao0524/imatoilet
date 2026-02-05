package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equipment")
@Data
@NoArgsConstructor
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Toiletテーブルとの紐付け（多対1）
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toilet_id", nullable = false)
    private Toilet toilet;

    // 設備の種類
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentType type;

    // コンストラクタ
    public Equipment(Toilet toilet, EquipmentType type) {
        this.toilet = toilet;
        this.type = type;
    }
}