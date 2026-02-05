package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    // 特定のトイレIDに紐づく設備をすべて取得する
    List<Equipment> findByToilet_Id(Long toiletId);
    
    // 特定のトイレの、特定の設備を探す（重複チェック用）
    boolean existsByToilet_IdAndType(Long toiletId, EquipmentType type);
}