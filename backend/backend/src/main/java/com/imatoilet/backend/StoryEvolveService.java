package com.imatoilet.backend;

import com.imatoilet.backend.dto.GameDataResponseDto;
import com.imatoilet.backend.dto.StoryEvolveRequestDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StoryEvolveService {

    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final BattleService battleService;

    public StoryEvolveService(UserRepository userRepository,
                              InventoryService inventoryService,
                              BattleService battleService) {
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.battleService = battleService;
    }

    /**
     * ストーリー進行時の装備進化。
     * 現在のtierからtargetTierまで段階的に進化の核のみ消費。
     * - 結晶は消費しない
     * - 強化+3の前提条件なし
     * - 強化値リセットなし
     */
    public GameDataResponseDto storyEvolve(String userId, StoryEvolveRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", userId));

        int targetTier = request.getTargetTier();

        // 既に到達済みなら何もせず現在データを返す（冪等）
        if (user.getWeaponTier() >= targetTier) {
            return battleService.getGameData(userId);
        }

        // 現在tierからtargetTierまで段階的に核を消費
        while (user.getWeaponTier() < targetTier) {
            int currentTier = user.getWeaponTier();
            String coreKey = getCoreKey(currentTier);

            int coreAvailable = inventoryService.getQuantity(userId, coreKey);
            if (coreAvailable < 1) {
                throw new IllegalArgumentException(
                        "Not enough evolution core (" + coreKey + "). Required: 1, available: " + coreAvailable);
            }

            inventoryService.consumeMaterial(userId, coreKey, 1);

            user.setWeaponTier(currentTier + 1);
            user.setArmorTier(currentTier + 1);
            user.setAuraTier(currentTier + 1);
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
}