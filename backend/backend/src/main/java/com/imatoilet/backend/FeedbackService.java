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

    private final ToiletFeedbackRepository feedbackRepository;
    private final ToiletRepository toiletRepository;

    public FeedbackService(ToiletFeedbackRepository feedbackRepository, ToiletRepository toiletRepository) {
        this.feedbackRepository = feedbackRepository;
        this.toiletRepository = toiletRepository;
    }

    public FeedbackResponseDto processFeedback(Long toiletId, FeedbackRequestDto dto) {
        // 1. トイレの存在確認
        Toilet toilet = toiletRepository.findById(toiletId)
                .orElseThrow(() -> new ResourceNotFoundException("トイレ", "id", toiletId));

        // 2. フィードバックの保存
        ToiletFeedback feedback = new ToiletFeedback();
        feedback.setToiletId(toiletId);
        feedback.setFeeling(dto.getFeeling());
        feedback.setIssueTags(dto.getIssueTags());
        feedback.setUserLevel(dto.getUserLevel());
        feedbackRepository.save(feedback);

        // 3. TrustScoreの再計算 (直近30件)
        List<ToiletFeedback> recentFeedbacks = feedbackRepository.findTop30ByToiletIdOrderByCreatedAtDesc(toiletId);
        
        double totalScore = 0.0;
        int validCount = 0;

        for (ToiletFeedback fb : recentFeedbacks) {
            if ("CLOSED".equals(fb.getFeeling())) {
                continue; // CLOSEDは除外
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
            // 100点満点に換算して小数点第1位で四捨五入
            newTrustScore = (double) Math.round((totalScore / validCount) * 1000.0) / 10.0;
        }

        // 4. トイレ情報の更新
        toilet.setTrustScore(newTrustScore);
        int currentCount = toilet.getFeedbackCount() != null ? toilet.getFeedbackCount() : 0;
        toilet.setFeedbackCount(currentCount + 1);
        toiletRepository.save(toilet);

        return new FeedbackResponseDto(true, newTrustScore, toilet.getFeedbackCount());
    }
}