package com.imatoilet.backend;

import com.imatoilet.backend.dto.BattleResultRequestDto;
import com.imatoilet.backend.dto.GameDataResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public BattleService(UserRepository userRepository, BattleResultRepository battleResultRepository) {
        this.userRepository = userRepository;
        this.battleResultRepository = battleResultRepository;
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
            user.setBattleExp(user.getBattleExp() + dto.getExpGained());
            while (user.getBattleLevel() < MAX_LEVEL
                    && user.getBattleExp() >= LEVEL_THRESHOLDS[user.getBattleLevel()]) {
                user.setBattleLevel(user.getBattleLevel() + 1);
            }
            userRepository.save(user);
        }

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
                totalBattles
        );
    }
}
