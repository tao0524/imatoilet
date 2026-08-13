package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BattleResultRepository extends JpaRepository<BattleResult, Long> {
    List<BattleResult> findByUserIdOrderByFoughtAtDesc(String userId);
    long countByUserIdAndResult(String userId, String result);
    long countByUserId(String userId);
    long countByUserIdAndResultAndEnemyStarGreaterThanEqual(String userId, String result, int enemyStar);
}
