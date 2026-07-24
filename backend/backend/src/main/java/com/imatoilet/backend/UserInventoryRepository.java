package com.imatoilet.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserInventoryRepository extends JpaRepository<UserInventory, UserInventoryId> {

    List<UserInventory> findByUserId(String userId);

    Optional<UserInventory> findByUserIdAndMaterialKey(String userId, String materialKey);
}
