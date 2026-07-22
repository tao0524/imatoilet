package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ToiletReportRepository extends JpaRepository<ToiletReport, Long> {
    List<ToiletReport> findByToiletIdOrderByCreatedAtDesc(Long toiletId);
    long countByToiletIdAndStatus(Long toiletId, String status);
}
