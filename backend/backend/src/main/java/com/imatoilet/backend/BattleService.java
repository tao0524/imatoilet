package com.imatoilet.backend;

import com.imatoilet.backend.dto.BattleResultRequestDto;
import com.imatoilet.backend.dto.GameDataResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional(readOnly = true)
public class BattleService {

    private static final int[] LEVEL_THRESHOLDS = {
        0,      // Lv1
        30,     // Lv2
        80,     // Lv3
        160,    // Lv4
        280,    // Lv5
        450,    // Lv6
        680,    // Lv7
        1000,   // Lv8
        1400,   // Lv9
        1900,   // Lv10
    };

    private static final int MAX_LEVEL = LEVEL_THRESHOLDS.length;

    private final UserRepository userRepository;
    private final BattleResultRepository battleResultRepository;
    private final InventoryService inventoryService;

    public BattleService(UserRepository userRepository,
                         BattleResultRepository battleResultRepository,
                         InventoryService inventoryService) {
        this.userRepository = userRepository;
        this.battleResultRepository = battleResultRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public GameDataResponseDto submitBattleResult(String firebaseUid, BattleResultRequestDto dto) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", firebaseUid));

        BattleResult record = new BattleResult();
        record.setUserId(firebaseUid);
        record.setEnemyId(dto.getEnemyId());
        record.setEnemyStar(dto.getEnemyStar());
        record.setResult(dto.getResult());
        record.setExpGained(dto.getExpGained());
        record.setCrystalAttribute(dto.getCrystalAttribute());
        record.setCrystalCount(dto.getCrystalCount());
        record.setToiletId(dto.getToiletId());
        battleResultRepository.save(record);

        if ("WIN".equals(dto.getResult())) {
            if (dto.getEnemyId() != null && dto.getEnemyId().startsWith("phantom_star4_")) {
                // 幻影ボス撃破: Tier5素材 + 結晶 + 幻影扉クリア
                String attribute = dto.getEnemyId().replace("phantom_star4_", "");
                inventoryService.addMaterial(firebaseUid, "phantom_" + attribute, 1);
                inventoryService.addMaterial(firebaseUid, "crystal_" + attribute, 5);
                user.setHeldPhantomDoorEnemyId(null);
            } else if (dto.getEnemyId() != null && dto.getEnemyId().startsWith("star4_")) {
                String crystalKey = "crystal_" + dto.getEnemyId().replace("star4_", "");
                inventoryService.addMaterial(firebaseUid, crystalKey, 5);
                String coreKey = getBossCoreKey(dto.getEnemyId());
                inventoryService.addMaterial(firebaseUid, coreKey, 1);
                user.setPurifyStone(user.getPurifyStone() + 1);
                user.setHeldDoorEnemyId(null);
            } else {
                if (dto.getCrystalAttribute() != null && dto.getCrystalCount() > 0) {
                    String materialKey = "crystal_" + dto.getCrystalAttribute().toLowerCase();
                    inventoryService.addMaterial(firebaseUid, materialKey, dto.getCrystalCount());
                }
                // 初回★3 WIN: 浄化の輝石を確定ドロップ
                if (dto.getEnemyStar() >= 3) {
                    long priorStar3Wins = battleResultRepository.countByUserIdAndResultAndEnemyStarGreaterThanEqual(
                        firebaseUid, "WIN", 3);
                    // priorStar3Wins == 1 = 今回のレコードが最初の★3 WIN（既にsave済み）
                    if (priorStar3Wins == 1) {
                        user.setPurifyStone(user.getPurifyStone() + 1);
                    }
                }
            }

            user.setBattleExp(user.getBattleExp() + dto.getExpGained());
            while (user.getBattleLevel() < MAX_LEVEL
                    && user.getBattleExp() >= LEVEL_THRESHOLDS[user.getBattleLevel()]) {
                user.setBattleLevel(user.getBattleLevel() + 1);
            }
            userRepository.save(user);
        }

        return buildGameData(user);
    }

    @Transactional
    public GameDataResponseDto updateWeaponAttribute(String firebaseUid, String weaponAttribute) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", firebaseUid));
        user.setWeaponAttribute(weaponAttribute);
        userRepository.save(user);
        return buildGameData(user);
    }

    public GameDataResponseDto getGameData(String firebaseUid) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", firebaseUid));
        return buildGameData(user);
    }

    private GameDataResponseDto buildGameData(User user) {
        long totalWins = battleResultRepository.countByUserIdAndResult(user.getId(), "WIN");
        long totalBattles = battleResultRepository.countByUserId(user.getId());

        int expToNext = user.getBattleLevel() < MAX_LEVEL
                ? LEVEL_THRESHOLDS[user.getBattleLevel()] - user.getBattleExp()
                : 0;

        Map<String, Integer> crystals = inventoryService.getCrystalQuantities(user.getId());

        int coreSwamp = inventoryService.getQuantity(user.getId(), "core_swamp");
        int coreRuins = inventoryService.getQuantity(user.getId(), "core_ruins");
        int corePurify = inventoryService.getQuantity(user.getId(), "core_purify");

        int itemCleanWater = inventoryService.getQuantity(user.getId(), "item_clean_water");
        int itemPurifyDrop = inventoryService.getQuantity(user.getId(), "item_purify_drop");
        int itemHolySpring = inventoryService.getQuantity(user.getId(), "item_holy_spring");
        int itemMegamiDrop = inventoryService.getQuantity(user.getId(), "item_megami_drop");

        int phantomNature = inventoryService.getQuantity(user.getId(), "phantom_nature");
        int phantomSteel = inventoryService.getQuantity(user.getId(), "phantom_steel");
        int phantomPure = inventoryService.getQuantity(user.getId(), "phantom_pure");
        int phantomChaos = inventoryService.getQuantity(user.getId(), "phantom_chaos");

        return new GameDataResponseDto(
                user.getBattleLevel(),
                user.getBattleExp(),
                expToNext,
                user.getWeaponAttribute(),
                user.getWeaponTier(),
                user.getWeaponEnhancement(),
                user.getArmorTier(),
                user.getArmorEnhancement(),
                user.getAuraTier(),
                user.getAuraEnhancement(),
                totalWins,
                totalBattles,
                user.getStoryChapter(),
                user.getStoryScene(),
                crystals.getOrDefault("crystal_nature", 0),
                crystals.getOrDefault("crystal_steel", 0),
                crystals.getOrDefault("crystal_pure", 0),
                crystals.getOrDefault("crystal_chaos", 0),
                coreSwamp,
                coreRuins,
                corePurify,
                user.getHeldDoorEnemyId(),
                user.getPurifyStone(),
                itemCleanWater,
                itemPurifyDrop,
                itemHolySpring,
                itemMegamiDrop,
                user.getHeldPhantomDoorEnemyId(),
                phantomNature,
                phantomSteel,
                phantomPure,
                phantomChaos
        );
    }

    private String getBossCoreKey(String enemyId) {
        return switch (enemyId) {
            case "star4_nature" -> "core_swamp";
            case "star4_steel"  -> "core_ruins";
            case "star4_pure"   -> "core_purify";
            case "star4_chaos"  -> "core_swamp";
            default -> throw new IllegalArgumentException("Unknown boss: " + enemyId);
        };
    }
}
