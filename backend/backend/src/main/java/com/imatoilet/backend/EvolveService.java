package com.imatoilet.backend;

import com.imatoilet.backend.dto.EvolveRequestDto;
import com.imatoilet.backend.dto.GameDataResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EvolveService {

    private static final int MAX_TIER = 4;
    private static final int REQUIRED_ENHANCEMENT = 3;

    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final BattleService battleService;

    public EvolveService(UserRepository userRepository,
                         InventoryService inventoryService,
                         BattleService battleService) {
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.battleService = battleService;
    }

    public GameDataResponseDto evolve(String userId, EvolveRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", userId));

        int currentTier;
        int currentEnhancement;
        switch (request.getTargetSlot()) {
            case "RIGHT_HAND" -> {
                currentTier = user.getWeaponTier();
                currentEnhancement = user.getWeaponEnhancement();
            }
            case "HEAD" -> {
                currentTier = user.getArmorTier();
                currentEnhancement = user.getArmorEnhancement();
            }
            case "AURA" -> {
                currentTier = user.getAuraTier();
                currentEnhancement = user.getAuraEnhancement();
            }
            default -> throw new IllegalArgumentException(
                    "Invalid target slot: " + request.getTargetSlot());
        }

        if (currentTier >= MAX_TIER) {
            throw new IllegalArgumentException("Already at max tier (T4)");
        }
        if (currentEnhancement < REQUIRED_ENHANCEMENT) {
            throw new IllegalArgumentException(
                    "Enhancement must be +3 to evolve (current: +" + currentEnhancement + ")");
        }

        if ("RIGHT_HAND".equals(request.getTargetSlot())) {
            if (!request.getConsumedCrystalAttribute().equalsIgnoreCase(user.getWeaponAttribute())) {
                throw new IllegalArgumentException(
                        "Weapon requires matching crystal attribute: " + user.getWeaponAttribute());
            }
        }

        String coreKey = getCoreKey(currentTier);
        int crystalCost = getCrystalCost(currentTier);
        String crystalKey = "crystal_" + request.getConsumedCrystalAttribute().toLowerCase();

        int coreAvailable = inventoryService.getQuantity(userId, coreKey);
        if (coreAvailable < 1) {
            throw new IllegalArgumentException(
                    "Not enough evolution core. Required: 1, available: " + coreAvailable);
        }

        int crystalAvailable = inventoryService.getQuantity(userId, crystalKey);
        if (crystalAvailable < crystalCost) {
            throw new IllegalArgumentException(
                    "Not enough crystals. Required: " + crystalCost + ", available: " + crystalAvailable);
        }

        inventoryService.consumeMaterial(userId, coreKey, 1);
        inventoryService.consumeMaterial(userId, crystalKey, crystalCost);

        switch (request.getTargetSlot()) {
            case "RIGHT_HAND" -> {
                user.setWeaponTier(currentTier + 1);
                user.setWeaponEnhancement(0);
            }
            case "HEAD" -> {
                user.setArmorTier(currentTier + 1);
                user.setArmorEnhancement(0);
            }
            case "AURA" -> {
                user.setAuraTier(currentTier + 1);
                user.setAuraEnhancement(0);
            }
        }
        userRepository.save(user);

        return battleService.getGameData(userId);
    }

    private String getCoreKey(int currentTier) {
        return switch (currentTier) {
            case 1 -> "core_swamp";
            case 2 -> "core_ruins";
            case 3 -> "core_purify";
            default -> throw new IllegalArgumentException("Cannot evolve from tier " + currentTier);
        };
    }

    private int getCrystalCost(int currentTier) {
        return switch (currentTier) {
            case 1 -> 5;
            case 2 -> 8;
            case 3 -> 12;
            default -> throw new IllegalArgumentException("Cannot evolve from tier " + currentTier);
        };
    }
}
