package com.imatoilet.backend;

import com.imatoilet.backend.dto.EnhanceRequestDto;
import com.imatoilet.backend.dto.GameDataResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EnhanceService {

    private static final int MAX_ENHANCEMENT = 5;

    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final BattleService battleService;

    public EnhanceService(UserRepository userRepository,
                          InventoryService inventoryService,
                          BattleService battleService) {
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.battleService = battleService;
    }

    public GameDataResponseDto enhance(String userId, EnhanceRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", userId));

        int currentEnhancement = switch (request.getTargetSlot()) {
            case "RIGHT_HAND" -> user.getWeaponEnhancement();
            case "HEAD" -> user.getArmorEnhancement();
            case "AURA" -> user.getAuraEnhancement();
            default -> throw new IllegalArgumentException(
                    "Invalid target slot: " + request.getTargetSlot());
        };

        if (currentEnhancement >= MAX_ENHANCEMENT) {
            throw new IllegalArgumentException("Equipment already at max enhancement (+" + MAX_ENHANCEMENT + ")");
        }

        int cost = getEnhanceCost(currentEnhancement);
        String materialKey = "crystal_" + request.getConsumedCrystalAttribute().toLowerCase();

        if ("RIGHT_HAND".equals(request.getTargetSlot())) {
            if (!request.getConsumedCrystalAttribute().equalsIgnoreCase(user.getWeaponAttribute())) {
                throw new IllegalArgumentException(
                        "Weapon requires matching crystal attribute: " + user.getWeaponAttribute());
            }
        }

        int available = inventoryService.getQuantity(userId, materialKey);
        if (available < cost) {
            throw new IllegalArgumentException(
                    "Not enough crystals. Required: " + cost + ", available: " + available);
        }

        // 限界突破（+3→+4, +4→+5）は浄化の輝石を消費
        int stoneCost = getLimitBreakStoneCost(currentEnhancement);
        if (stoneCost > 0) {
            int availableStones = user.getPurifyStone();
            if (availableStones < stoneCost) {
                throw new IllegalArgumentException(
                        "Not enough purify stones. Required: " + stoneCost + ", available: " + availableStones);
            }
            user.setPurifyStone(availableStones - stoneCost);
        }

        inventoryService.consumeMaterial(userId, materialKey, cost);

        switch (request.getTargetSlot()) {
            case "RIGHT_HAND" -> user.setWeaponEnhancement(user.getWeaponEnhancement() + 1);
            case "HEAD" -> user.setArmorEnhancement(user.getArmorEnhancement() + 1);
            case "AURA" -> user.setAuraEnhancement(user.getAuraEnhancement() + 1);
        }
        userRepository.save(user);

        return battleService.getGameData(userId);
    }

    private int getEnhanceCost(int currentEnhancement) {
        return switch (currentEnhancement) {
            case 0 -> 3;
            case 1 -> 5;
            case 2 -> 8;
            case 3 -> 6;
            case 4 -> 10;
            default -> throw new IllegalArgumentException("Enhancement already at max");
        };
    }

    private int getLimitBreakStoneCost(int currentEnhancement) {
        return switch (currentEnhancement) {
            case 3 -> 1;
            case 4 -> 2;
            default -> 0;
        };
    }
}
