package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 特定のトイレのレビューを、作成日時の降順（新しい順）で取得する
    List<Review> findByToiletIdOrderByCreatedAtDesc(Long toiletId);
}