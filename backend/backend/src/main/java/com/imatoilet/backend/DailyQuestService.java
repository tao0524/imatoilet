package com.imatoilet.backend;

import com.imatoilet.backend.dto.DailyQuestResponseDto;
import com.imatoilet.backend.dto.DailyQuestResponseDto.QuestSlotDto;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@Transactional
public class DailyQuestService {

    enum QuestType {
        FIRST_STEP("冒険の一歩", "任意のトイレで1回ちょうさ"),
        KEEN_REPORTER("目利きの報告者", "GREAT評価を1回報告"),
        WIDE_PATROL("広域パトロール", "2箇所の異なるトイレを探索"),
        PURIFY_WARRIOR("浄化の戦士", "trustScore60未満のトイレでちょうさ"),
        UNCHARTED("未踏の地へ", "初めてのトイレでちょうさ"),
        VETERAN_SURVEYOR("熟練の調査員", "3箇所の異なるトイレを探索");

        final String title;
        final String description;

        QuestType(String title, String description) {
            this.title = title;
            this.description = description;
        }
    }

    private static final List<QuestType> EASY_POOL = List.of(
        QuestType.FIRST_STEP, QuestType.KEEN_REPORTER
    );

    private final DailyQuestRepository dailyQuestRepository;
    private final UserQuestProgressRepository progressRepository;
    private final ToiletRepository toiletRepository;

    public DailyQuestService(DailyQuestRepository dailyQuestRepository,
                             UserQuestProgressRepository progressRepository,
                             ToiletRepository toiletRepository) {
        this.dailyQuestRepository = dailyQuestRepository;
        this.progressRepository = progressRepository;
        this.toiletRepository = toiletRepository;
    }

    public DailyQuestResponseDto getDailyQuests(String userId) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Tokyo"));

        DailyQuest dailyQuest = getOrCreateDailyQuest(today);

        List<UserQuestProgress> progressList = getOrCreateProgress(userId, today);

        String[] types = {
            dailyQuest.getQuestType1(),
            dailyQuest.getQuestType2(),
            dailyQuest.getQuestType3()
        };

        List<QuestSlotDto> quests = new ArrayList<>();
        int completedCount = 0;

        for (int i = 0; i < 3; i++) {
            final int slot = i + 1;
            QuestType qt = QuestType.valueOf(types[i]);
            UserQuestProgress progress = progressList.stream()
                .filter(p -> p.getSlot() == slot)
                .findFirst()
                .orElseThrow();

            boolean done = progress.getCompleted();
            if (done) completedCount++;

            String completedAtStr = progress.getCompletedAt() != null
                ? progress.getCompletedAt().toString()
                : null;

            quests.add(new QuestSlotDto(
                i + 1, types[i], qt.title, qt.description, done, completedAtStr
            ));
        }

        boolean allCompleted = completedCount == 3;

        return new DailyQuestResponseDto(
            today, quests, completedCount, allCompleted, allCompleted
        );
    }

    private DailyQuest getOrCreateDailyQuest(LocalDate today) {
        Optional<DailyQuest> existing = dailyQuestRepository.findByQuestDate(today);
        if (existing.isPresent()) {
            return existing.get();
        }

        DailyQuest quest = new DailyQuest();
        quest.setQuestDate(today);

        Random random = new Random();

        QuestType easy = EASY_POOL.get(random.nextInt(EASY_POOL.size()));
        quest.setQuestType1(easy.name());

        List<QuestType> remainPool = new ArrayList<>();
        for (QuestType qt : EASY_POOL) {
            if (qt != easy) remainPool.add(qt);
        }
        remainPool.add(QuestType.WIDE_PATROL);
        remainPool.add(QuestType.UNCHARTED);
        remainPool.add(QuestType.VETERAN_SURVEYOR);

        if (toiletRepository.existsByTrustScoreLessThan(60.0)) {
            remainPool.add(QuestType.PURIFY_WARRIOR);
        }

        Collections.shuffle(remainPool, random);
        quest.setQuestType2(remainPool.get(0).name());
        quest.setQuestType3(remainPool.get(1).name());

        try {
            return dailyQuestRepository.save(quest);
        } catch (DataIntegrityViolationException e) {
            return dailyQuestRepository.findByQuestDate(today)
                .orElseThrow(() -> new RuntimeException("デイリークエスト生成に失敗しました"));
        }
    }

    private List<UserQuestProgress> getOrCreateProgress(String userId, LocalDate today) {
        List<UserQuestProgress> existing = progressRepository.findByUserIdAndQuestDate(userId, today);
        if (existing.size() == 3) {
            return existing;
        }

        Set<Integer> existingSlots = new HashSet<>();
        for (UserQuestProgress p : existing) {
            existingSlots.add(p.getSlot());
        }

        List<UserQuestProgress> result = new ArrayList<>(existing);
        for (int slot = 1; slot <= 3; slot++) {
            if (!existingSlots.contains(slot)) {
                UserQuestProgress progress = new UserQuestProgress();
                progress.setUserId(userId);
                progress.setQuestDate(today);
                progress.setSlot(slot);
                progress.setCompleted(false);
                result.add(progressRepository.save(progress));
            }
        }

        return result;
    }
}
