package com.imatoilet.backend;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore; // ★追加
import lombok.EqualsAndHashCode; // ★追加
import lombok.ToString; // ★追加

@Entity
@Table(name = "equipment")
@Data
@NoArgsConstructor
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 修正後:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toilet_id", nullable = false)
    @JsonIgnore             // ★親に戻らない（重要）
    @ToString.Exclude       // ★Lombokの無限ループ防止
    @EqualsAndHashCode.Exclude // ★Lombokの無限ループ防止
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