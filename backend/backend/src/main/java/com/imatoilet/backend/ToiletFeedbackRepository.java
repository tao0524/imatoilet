package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ToiletFeedbackRepository extends JpaRepository<ToiletFeedback, Long> {
    // 直近30件のフィードバックを作成日時の降順で取得（TrustScore計算用）
    List<ToiletFeedback> findTop30ByToiletIdOrderByCreatedAtDesc(Long toiletId);

    boolean existsByUserIdAndToiletId(String userId, Long toiletId);

    long countByUserIdAndCreatedAtBetween(String userId, LocalDateTime start, LocalDateTime end);

    long countByUserIdAndFeelingAndCreatedAtBetween(String userId, String feeling, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT f.toiletId) FROM ToiletFeedback f WHERE f.userId = :userId AND f.createdAt BETWEEN :start AND :end")
    long countDistinctToiletIdByUserIdAndCreatedAtBetween(@Param("userId") String userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}