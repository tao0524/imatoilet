package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ToiletEditRepository extends JpaRepository<ToiletEdit, Long> {
    List<ToiletEdit> findByToiletIdOrderByCreatedAtDesc(Long toiletId);
}
