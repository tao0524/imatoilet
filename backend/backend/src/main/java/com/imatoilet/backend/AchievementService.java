package com.imatoilet.backend;

import com.imatoilet.backend.dto.AchievementResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AchievementService {

    private final UserAchievementRepository achievementRepository;
    private final ToiletFeedbackRepository feedbackRepository;

    public AchievementService(UserAchievementRepository achievementRepository,
                              ToiletFeedbackRepository feedbackRepository) {
        this.achievementRepository = achievementRepository;
        this.feedbackRepository = feedbackRepository;
    }

    /**
     * チェックイン後に呼ばれる。未解放の称号を判定し、新たに解放されたものを返す。
     */
    public List<AchievementResponseDto> checkAndUnlock(String userId, int contributionCount) {
        // 1. 既に解放済みの称号キーを取得
        Set<AchievementType> unlocked = achievementRepository.findByUserId(userId).stream()
                .map(UserAchievement::getAchievementKey)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(AchievementType.class)));

        // 2. 未解放の称号だけチェック
        Set<AchievementType> toCheck = EnumSet.allOf(AchievementType.class);
        toCheck.removeAll(unlocked);

        if (toCheck.isEmpty()) {
            return List.of();
        }

        // 3. 必要なデータを条件に応じて取得（無駄なクエリを避ける）
        Map<String, Long> categoryCounts = null;
        Long distinctToiletCount = null;
        Long lowTrustCount = null;

        boolean needCategory = toCheck.stream().anyMatch(this::isCategoryAchievement);
        boolean needDistinct = toCheck.contains(AchievementType.WIDE_TRAVELER)
                            || toCheck.contains(AchievementType.CARTOGRAPHER);
        boolean needPurify = toCheck.contains(AchievementType.PURIFIER);

        if (needCategory) {
            List<Object[]> rows = feedbackRepository.countByUserIdGroupByFacilityCategory(userId);
            categoryCounts = rows.stream()
                    .collect(Collectors.toMap(
                            r -> (String) r[0],
                            r -> (Long) r[1]
                    ));
        }

        if (needDistinct) {
            distinctToiletCount = feedbackRepository.countDistinctToiletIdByUserId(userId);
        }

        if (needPurify) {
            lowTrustCount = feedbackRepository.countDistinctLowTrustToiletsByUserId(userId);
        }

        // 4. 各称号の条件判定
        List<AchievementResponseDto> newlyUnlocked = new ArrayList<>();

        for (AchievementType type : toCheck) {
            boolean achieved = checkCondition(
                    type, contributionCount, categoryCounts, distinctToiletCount, lowTrustCount
            );

            if (achieved) {
                achievementRepository.save(new UserAchievement(userId, type));
                newlyUnlocked.add(new AchievementResponseDto(
                        type.name(),
                        type.getDisplayName(),
                        type.getDescription(),
                        type.getIcon()
                ));
            }
        }

        return newlyUnlocked;
    }

    private boolean checkCondition(AchievementType type,
                                   int contributionCount,
                                   Map<String, Long> categoryCounts,
                                   Long distinctToiletCount,
                                   Long lowTrustCount) {
        switch (type) {
            // 基本マイルストーン
            case FIRST_ADVENTURE:
                return contributionCount >= 1;
            case SEASONED_EXPLORER:
                return contributionCount >= 10;
            case VETERAN_ADVENTURER:
                return contributionCount >= 30;

            // 施設カテゴリ別
            case CONVENIENCE_EXPLORER:
                return getCategoryCount(categoryCounts, "convenience") >= 5;
            case PARK_MASTER:
                return getCategoryCount(categoryCounts, "park") >= 5;
            case STATION_RANGER:
                return getCategoryCount(categoryCounts, "station") >= 5;
            case MALL_NAVIGATOR:
                return getCategoryCount(categoryCounts, "commercial") >= 5;

            // 探索系
            case WIDE_TRAVELER:
                return distinctToiletCount != null && distinctToiletCount >= 10;
            case CARTOGRAPHER:
                return distinctToiletCount != null && distinctToiletCount >= 25;

            // 浄化系
            case PURIFIER:
                return lowTrustCount != null && lowTrustCount >= 3;

            default:
                return false;
        }
    }

    private long getCategoryCount(Map<String, Long> categoryCounts, String category) {
        if (categoryCounts == null) return 0;
        return categoryCounts.getOrDefault(category, 0L);
    }

    private boolean isCategoryAchievement(AchievementType type) {
        return type == AchievementType.CONVENIENCE_EXPLORER
            || type == AchievementType.PARK_MASTER
            || type == AchievementType.STATION_RANGER
            || type == AchievementType.MALL_NAVIGATOR;
    }

    /**
     * ユーザーの全称号一覧を返す（アバター画面用）。
     */
    public List<AchievementResponseDto> getUnlockedAchievements(String userId) {
        return achievementRepository.findByUserId(userId).stream()
                .map(ua -> {
                    AchievementType type = ua.getAchievementKey();
                    return new AchievementResponseDto(
                            type.name(),
                            type.getDisplayName(),
                            type.getDescription(),
                            type.getIcon()
                    );
                })
                .collect(Collectors.toList());
    }
}
