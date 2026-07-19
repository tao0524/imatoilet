package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ToiletFeedbackRepository extends JpaRepository<ToiletFeedback, Long> {
    // 直近30件のフィードバックを作成日時の降順で取得（TrustScore計算用）
    List<ToiletFeedback> findTop30ByToiletIdOrderByCreatedAtDesc(Long toiletId);

    boolean existsByUserIdAndToiletId(String userId, Long toiletId);
}