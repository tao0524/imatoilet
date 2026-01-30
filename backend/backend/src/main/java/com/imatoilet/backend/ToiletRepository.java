package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ToiletRepository extends JpaRepository<Toilet, Long> {
}
