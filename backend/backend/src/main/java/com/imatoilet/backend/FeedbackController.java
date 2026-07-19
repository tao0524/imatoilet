package com.imatoilet.backend;

import com.imatoilet.backend.dto.FeedbackRequestDto;
import com.imatoilet.backend.dto.FeedbackResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/toilets/{id}/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<FeedbackResponseDto> submitFeedback(
            @PathVariable Long id,
            @RequestBody @Valid FeedbackRequestDto dto,
            HttpServletRequest request) {

        String userId = (String) request.getAttribute(
            com.imatoilet.backend.config.FirebaseAuthFilter.FIREBASE_UID_ATTR
        );
        FeedbackResponseDto response = feedbackService.processFeedback(id, dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}