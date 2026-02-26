package com.imatoilet.backend;

import com.imatoilet.backend.dto.ReviewRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toilets/{id}/reviews")
public class ReviewApiController {

    private final ReviewService reviewService;

    public ReviewApiController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // レビュー一覧の取得 (GET /api/toilets/{id}/reviews)
    @GetMapping
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long id) {
        List<Review> reviews = reviewService.getReviewsByToiletId(id);
        return ResponseEntity.ok(reviews);
    }

    // 新規レビューの投稿 (POST /api/toilets/{id}/reviews)
    // ※ SecurityConfig および AdminTokenFilter の設定上、POSTリクエストは一般公開（トークン不要）となります。
    @PostMapping
    public ResponseEntity<Review> createReview(
            @PathVariable Long id,
            @RequestBody @Valid ReviewRequestDto dto) {
        
        Review saved = reviewService.addReview(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}