package com.imatoilet.backend;

import com.imatoilet.backend.dto.FeedbackRequestDto;
import com.imatoilet.backend.dto.FeedbackResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public FeedbackService(ToiletFeedbackRepository feedbackRepository,
                           ToiletRepository toiletRepository,
                           UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.toiletRepository = toiletRepository;
        this.userRepository = userRepository;
    }

    public FeedbackResponseDto processFeedback(Long toiletId, FeedbackRequestDto dto, String userId) {
        // 1. トイレの存在確認
        Toilet toilet = toiletRepository.findById(toiletId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", toiletId));

        // 2. フィードバックの保存
        ToiletFeedback feedback = new ToiletFeedback();
        feedback.setToiletId(toiletId);
        feedback.setFeeling(dto.getFeeling());
        feedback.setIssueTags(dto.getIssueTags());
        feedback.setUserLevel(dto.getUserLevel());

        int earnedExp = 0;
        Integer updatedTotalExp = null;
        Integer updatedLevel = null;
        Integer updatedContributionCount = null;

        if (userId != null) {
            User user = userRepository.findById(userId).orElseGet(() -> {
                User newUser = new User();
                newUser.setId(userId);
                return userRepository.save(newUser);
            });
            feedback.setUserId(userId);

            // EXP計算
            earnedExp = 10;
            if (dto.getIssueTags() != null && !dto.getIssueTags().isEmpty()) {
                earnedExp += 5;
            }
            boolean isFirstCheckin = !feedbackRepository.existsByUserIdAndToiletId(userId, toiletId);
            if (isFirstCheckin) {
                earnedExp += 10;
            }

            user.setTotalExp(user.getTotalExp() + earnedExp);
            user.setLevel(calcLevel(user.getTotalExp()));
            user.setContributionCount(user.getContributionCount() + 1);
            userRepository.save(user);

            updatedTotalExp = user.getTotalExp();
            updatedLevel = user.getLevel();
            updatedContributionCount = user.getContributionCount();
        }

        feedbackRepository.save(feedback);

        // 3. TrustScoreの再計算 (直近30件)
        List<ToiletFeedback> recentFeedbacks = feedbackRepository.findTop30ByToiletIdOrderByCreatedAtDesc(toiletId);

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

        // 4. トイレ情報の更新
        toilet.setTrustScore(newTrustScore);
        int currentCount = toilet.getFeedbackCount() != null ? toilet.getFeedbackCount() : 0;
        toilet.setFeedbackCount(currentCount + 1);
        toiletRepository.save(toilet);

        return new FeedbackResponseDto(
            true, newTrustScore, toilet.getFeedbackCount(),
            earnedExp, updatedTotalExp, updatedLevel, updatedContributionCount
        );
    }
}
