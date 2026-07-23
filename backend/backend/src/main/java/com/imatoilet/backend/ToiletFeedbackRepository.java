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

    // === 称号判定用クエリ（P1-2追加） ===

    @Query(value = "SELECT t.facility_category, COUNT(*) FROM toilet_feedback f JOIN toilet t ON f.toilet_id = t.id WHERE f.user_id = :userId AND t.facility_category IS NOT NULL GROUP BY t.facility_category", nativeQuery = true)
    List<Object[]> countByUserIdGroupByFacilityCategory(@Param("userId") String userId);

    @Query("SELECT COUNT(DISTINCT f.toiletId) FROM ToiletFeedback f WHERE f.userId = :userId")
    long countDistinctToiletIdByUserId(@Param("userId") String userId);

    @Query(value = "SELECT COUNT(DISTINCT f.toilet_id) FROM toilet_feedback f JOIN toilet t ON f.toilet_id = t.id WHERE f.user_id = :userId AND t.trust_score IS NOT NULL AND t.trust_score < 40", nativeQuery = true)
    long countDistinctLowTrustToiletsByUserId(@Param("userId") String userId);
}
