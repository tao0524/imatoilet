package com.imatoilet.backend;

import com.imatoilet.backend.dto.AchievementResponseDto;
import com.imatoilet.backend.dto.FeedbackRequestDto;
import com.imatoilet.backend.dto.FeedbackResponseDto;
import com.imatoilet.backend.dto.MaterialDropDto;
import com.imatoilet.backend.dto.QuestResultDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FeedbackService {

    private static final int[] LEVEL_THRESHOLDS = {0, 100, 300, 700, 1500};

    private static int calcLevel(int totalExp) {
        int level = 1;
        for (int i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalExp >= LEVEL_THRESHOLDS[i]) {
                level = i + 1;
                break;
            }
        }
        return level;
    }

    private final ToiletFeedbackRepository feedbackRepository;
    private final ToiletRepository toiletRepository;
    private final UserRepository userRepository;
    private final DailyQuestRepository dailyQuestRepository;
    private final UserQuestProgressRepository progressRepository;
    private final AchievementService achievementService;
    private final InventoryService inventoryService;
    private final BattleResultRepository battleResultRepository;

    public FeedbackService(ToiletFeedbackRepository feedbackRepository,
                           ToiletRepository toiletRepository,
                           UserRepository userRepository,
                           DailyQuestRepository dailyQuestRepository,
                           UserQuestProgressRepository progressRepository,
                           AchievementService achievementService,
                           InventoryService inventoryService,
                           BattleResultRepository battleResultRepository) {
        this.feedbackRepository = feedbackRepository;
        this.toiletRepository = toiletRepository;
        this.userRepository = userRepository;
        this.dailyQuestRepository = dailyQuestRepository;
        this.progressRepository = progressRepository;
        this.achievementService = achievementService;
        this.inventoryService = inventoryService;
        this.battleResultRepository = battleResultRepository;
    }

    public FeedbackResponseDto processFeedback(Long toiletId, FeedbackRequestDto dto, String userId) {

        // 1. トイレの存在確認
        Toilet toilet = toiletRepository.findById(toiletId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", toiletId));

        // レイドボス判定用: チェックイン前のtrustScore
        Double oldTrustScore = toilet.getTrustScore();
        boolean wasBossActive = oldTrustScore != null && oldTrustScore < 40.0;

        // 2. フィードバックの保存
        ToiletFeedback feedback = new ToiletFeedback();
        feedback.setToiletId(toiletId);
        feedback.setFeeling(dto.getFeeling());
        feedback.setIssueTags(dto.getIssueTags());
        feedback.setUserLevel(dto.getUserLevel());

        int baseExp = 0;
        boolean isFirstCheckin = false;
        Integer updatedTotalExp = null;
        Integer updatedLevel = null;
        Integer updatedContributionCount = null;

        List<QuestResultDto> questResults = null;
        int questExpTotal = 0;
        int completionBonusExp = 0;
        boolean allQuestsCompleted = false;
        int raidContributionExp = 0;
        int raidFinishingBlowExp = 0;
        boolean isPurified = false;
        List<AchievementResponseDto> newAchievements = List.of();
        MaterialDropDto droppedMaterial = null;
        List<String> newUnlockedEquipments = List.of();

        if (userId != null) {
            User user = userRepository.findById(userId).orElseGet(() -> {
                User newUser = new User();
                newUser.setId(userId);
                return userRepository.save(newUser);
            });
            feedback.setUserId(userId);

            // ベースEXP計算
            baseExp = 10;
            if (dto.getIssueTags() != null && !dto.getIssueTags().isEmpty()) {
                baseExp += 5;
            }
            isFirstCheckin = !feedbackRepository.existsByUserIdAndToiletId(userId, toiletId);
            if (isFirstCheckin) {
                baseExp += 10;
            }

            // フィードバックを先に保存（クエスト判定クエリに含めるため）
            feedbackRepository.save(feedback);

            // レイドボス貢献報酬
            if (wasBossActive && !"BAD".equals(dto.getFeeling())) {
                raidContributionExp = 10;
            }

            // デイリークエスト達成判定
            ZoneId jst = ZoneId.of("Asia/Tokyo");
            LocalDate todayJst = LocalDate.now(jst);

            Optional<DailyQuest> dailyQuestOpt = dailyQuestRepository.findByQuestDate(todayJst);

            if (dailyQuestOpt.isPresent()) {
                DailyQuest dailyQuest = dailyQuestOpt.get();

                List<UserQuestProgress> progressList =
                    progressRepository.findByUserIdAndQuestDate(userId, todayJst);

                if (progressList.isEmpty()) {
                    progressList = new ArrayList<>();
                    for (int slot = 1; slot <= 3; slot++) {
                        UserQuestProgress p = new UserQuestProgress();
                        p.setUserId(userId);
                        p.setQuestDate(todayJst);
                        p.setSlot(slot);
                        p.setCompleted(false);
                        progressList.add(progressRepository.save(p));
                    }
                }

                long completedBefore = progressList.stream()
                    .filter(UserQuestProgress::getCompleted)
                    .count();

                String[] questTypes = {
                    dailyQuest.getQuestType1(),
                    dailyQuest.getQuestType2(),
                    dailyQuest.getQuestType3()
                };

                LocalDateTime dayStart = todayJst.atStartOfDay(jst)
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
                LocalDateTime dayEnd = todayJst.plusDays(1).atStartOfDay(jst)
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

                questResults = new ArrayList<>();

                for (int i = 0; i < 3; i++) {
                    final int slotNum = i + 1;
                    String questTypeName = questTypes[i];
                    DailyQuestService.QuestType qt =
                        DailyQuestService.QuestType.valueOf(questTypeName);

                    UserQuestProgress progress = progressList.stream()
                        .filter(p -> p.getSlot() == slotNum)
                        .findFirst()
                        .orElseThrow();

                    boolean justCompleted = false;
                    int questExp = 0;

                    if (!progress.getCompleted()) {
                        boolean achieved = checkQuestCondition(
                            qt, userId, toiletId, toilet, isFirstCheckin,
                            dto.getFeeling(), dayStart, dayEnd
                        );

                        if (achieved) {
                            progress.setCompleted(true);
                            progress.setCompletedAt(OffsetDateTime.now());
                            progressRepository.save(progress);
                            justCompleted = true;
                            questExp = 10;
                            questExpTotal += 10;
                        }
                    }

                    questResults.add(new QuestResultDto(
                        slotNum, questTypeName, qt.title, justCompleted, questExp
                    ));
                }

                long completedAfter = progressList.stream()
                    .filter(UserQuestProgress::getCompleted)
                    .count();
                allQuestsCompleted = completedAfter == 3;

                if (completedBefore < 3 && completedAfter == 3) {
                    completionBonusExp = 20;
                }
            }

            // EXP合算（トドメ報酬はtrustScore再計算後に加算）
            int expBeforeFinishingBlow = baseExp + questExpTotal + completionBonusExp + raidContributionExp;
            user.setTotalExp(user.getTotalExp() + expBeforeFinishingBlow);
            user.setContributionCount(user.getContributionCount() + 1);
            userRepository.save(user);

            updatedTotalExp = user.getTotalExp();
            updatedLevel = user.getLevel();
            updatedContributionCount = user.getContributionCount();
        } else {
            feedbackRepository.save(feedback);
        }

        // 3. TrustScoreの再計算
        List<ToiletFeedback> recentFeedbacks =
            feedbackRepository.findTop30ByToiletIdOrderByCreatedAtDesc(toiletId);

        double totalScore = 0.0;
        int validCount = 0;

        for (ToiletFeedback fb : recentFeedbacks) {
            if ("CLOSED".equals(fb.getFeeling())) {
                continue;
            }
            validCount++;
            switch (fb.getFeeling()) {
                case "GREAT": totalScore += 1.0; break;
                case "OK": totalScore += 0.6; break;
                case "BAD": totalScore += 0.2; break;
            }
        }

        Double newTrustScore = null;
        if (validCount > 0) {
            newTrustScore = (double) Math.round((totalScore / validCount) * 1000.0) / 10.0;
        }

        // レイドボス・トドメ報酬判定
        if (userId != null && wasBossActive && newTrustScore != null && newTrustScore >= 40.0) {
            isPurified = true;
            raidFinishingBlowExp = 20;

            User user = userRepository.findById(userId).orElseThrow();
            user.setTotalExp(user.getTotalExp() + raidFinishingBlowExp);
            user.setLevel(calcLevel(user.getTotalExp()));
            userRepository.save(user);

            updatedTotalExp = user.getTotalExp();
            updatedLevel = user.getLevel();
        } else if (userId != null) {
            User user = userRepository.findById(userId).orElseThrow();
            user.setLevel(calcLevel(user.getTotalExp()));
            userRepository.save(user);

            updatedTotalExp = user.getTotalExp();
            updatedLevel = user.getLevel();
        }

        // 4. トイレ情報の更新
        toilet.setTrustScore(newTrustScore);
        int currentCount = toilet.getFeedbackCount() != null ? toilet.getFeedbackCount() : 0;
        toilet.setFeedbackCount(currentCount + 1);
        toiletRepository.save(toilet);

        // 5. 称号解放判定
        if (userId != null && updatedContributionCount != null) {
            newAchievements = achievementService.checkAndUnlock(userId, updatedContributionCount);
        }

        // 6. 素材ドロップ処理
        if (userId != null) {
            InventoryService.DropResult dropResult =
                    inventoryService.processDrop(userId, toilet.getFacilityCategory());
            droppedMaterial = dropResult.getDroppedMaterial();
            newUnlockedEquipments = dropResult.getNewlyUnlockedEquipments().stream()
                    .map(EquipmentItem::name)
                    .toList();
        }

        // 7. ストーリートリガー判定（DBは更新しない）
        Integer triggeredStoryChapter = null;
        Integer triggeredStoryScene = null;
        if (userId != null) {
            User storyUser = userRepository.findById(userId).orElseThrow();
            int chapter = storyUser.getStoryChapter();
            int scene = storyUser.getStoryScene();
            int checkins = storyUser.getContributionCount();

            if (chapter == 0 && scene == 0 && checkins >= 1) {
                triggeredStoryChapter = 1;
                triggeredStoryScene = 0;
            } else if (chapter == 1 && scene == 0 && checkins >= 2) {
                triggeredStoryChapter = 1;
                triggeredStoryScene = 1;
            } else if (chapter == 1 && scene == 1 && checkins >= 5) {
                triggeredStoryChapter = 2;
                triggeredStoryScene = 0;
            } else if (chapter == 2 && scene == 0 && checkins >= 7) {
                triggeredStoryChapter = 2;
                triggeredStoryScene = 1;
            } else if (chapter == 2 && scene == 1 && checkins >= 9) {
                triggeredStoryChapter = 2;
                triggeredStoryScene = 2;
            } else if (chapter == 2 && scene == 2 && checkins >= 10) {
                triggeredStoryChapter = 2;
                triggeredStoryScene = 3;
            } else if (chapter == 2 && scene == 3 && checkins >= 15) {
                triggeredStoryChapter = 2;
                triggeredStoryScene = 4;

            // ── 第2章トリガー（code chapter 3）──
            // シーン1: 錆びた気配（第1章クリア後チェックイン3回目）
            } else if (chapter == 2 && scene == 4 && checkins >= 18) {
                triggeredStoryChapter = 3;
                triggeredStoryScene = 0;
            // シーン2: ★3初遭遇（チェックイン5回目相当）
            } else if (chapter == 3 && scene == 0 && checkins >= 20) {
                triggeredStoryChapter = 3;
                triggeredStoryScene = 1;
            // シーン3: 限界突破チュートリアル（★3初撃破後）
            } else if (chapter == 3 && scene == 1) {
                long star3Wins = battleResultRepository.countByUserIdAndResultAndEnemyStarGreaterThanEqual(
                    storyUser.getId(), "WIN", 3);
                if (star3Wins > 0) {
                    triggeredStoryChapter = 3;
                    triggeredStoryScene = 2;
                }
            // シーン4: 廃墟の記憶（武器+3以上）
            } else if (chapter == 3 && scene == 2) {
                if (storyUser.getWeaponEnhancement() >= 3) {
                    triggeredStoryChapter = 3;
                    triggeredStoryScene = 3;
                }
            // シーン5: はいきょのばんにん（ボス戦トリガー）
            } else if (chapter == 3 && scene == 3 && checkins >= 30) {
                triggeredStoryChapter = 3;
                triggeredStoryScene = 4;
            }
            // シーン6: ボス撃破後はstory-progressで進行（FeedbackServiceでは扱わない）
        }

        return new FeedbackResponseDto(
            true, newTrustScore, toilet.getFeedbackCount(),
            baseExp, updatedTotalExp, updatedLevel, updatedContributionCount,
            isFirstCheckin, questResults, allQuestsCompleted,
            completionBonusExp, isPurified, raidContributionExp, raidFinishingBlowExp,
            newAchievements, droppedMaterial, newUnlockedEquipments,
            triggeredStoryChapter, triggeredStoryScene
        );
    }

    private boolean checkQuestCondition(
            DailyQuestService.QuestType questType,
            String userId, Long toiletId, Toilet toilet,
            boolean isFirstCheckin, String feeling,
            LocalDateTime dayStart, LocalDateTime dayEnd) {

        switch (questType) {
            case FIRST_STEP:
                return feedbackRepository.countByUserIdAndCreatedAtBetween(
                    userId, dayStart, dayEnd) >= 1;

            case KEEN_REPORTER:
                return feedbackRepository.countByUserIdAndFeelingAndCreatedAtBetween(
                    userId, "GREAT", dayStart, dayEnd) >= 1;

            case WIDE_PATROL:
                return feedbackRepository.countDistinctToiletIdByUserIdAndCreatedAtBetween(
                    userId, dayStart, dayEnd) >= 2;

            case PURIFY_WARRIOR:
                return toilet.getTrustScore() != null && toilet.getTrustScore() < 60.0;

            case UNCHARTED:
                return isFirstCheckin;

            case VETERAN_SURVEYOR:
                return feedbackRepository.countDistinctToiletIdByUserIdAndCreatedAtBetween(
                    userId, dayStart, dayEnd) >= 3;

            default:
                return false;
        }
    }
}
