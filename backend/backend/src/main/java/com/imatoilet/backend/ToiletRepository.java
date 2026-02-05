package com.imatoilet.backend;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull; // ★追加: これが必要です
import java.util.List;

public interface ToiletRepository extends JpaRepository<Toilet, Long> {

    // ★N+1対策
    @Override
    @EntityGraph(attributePaths = {"equipmentList"})
    @NonNull // ★追加: 親クラスのルールに合わせて「nullは返しません」と宣言
    List<Toilet> findAll();
}