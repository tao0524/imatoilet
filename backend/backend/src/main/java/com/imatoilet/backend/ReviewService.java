package com.imatoilet.backend;

import com.imatoilet.backend.dto.ReviewRequestDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ToiletService toiletService; // 既存のServiceを再利用してトイレの存在確認を行う

    public ReviewService(ReviewRepository reviewRepository, ToiletService toiletService) {
        this.reviewRepository = reviewRepository;
        this.toiletService = toiletService;
    }

    public List<Review> getReviewsByToiletId(Long toiletId) {
        // 対象のトイレが存在するか確認（存在しなければ ResourceNotFoundException が飛ぶ）
        toiletService.getToilet(toiletId);
        return reviewRepository.findByToiletIdOrderByCreatedAtDesc(toiletId);
    }

    public Review addReview(Long toiletId, ReviewRequestDto dto) {
        // 対象のトイレを取得
        Toilet toilet = toiletService.getToilet(toiletId);

        Review review = new Review();
        review.setToilet(toilet);
        
        // ニックネームが空の場合は「匿名」をセット
        String nickname = (dto.getNickname() == null || dto.getNickname().isBlank()) ? "匿名" : dto.getNickname();
        review.setNickname(nickname);
        
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        return reviewRepository.save(review);
    }
}