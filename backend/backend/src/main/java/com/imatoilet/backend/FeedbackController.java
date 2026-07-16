package com.imatoilet.backend;

import com.imatoilet.backend.dto.FeedbackRequestDto;
import com.imatoilet.backend.dto.FeedbackResponseDto;
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
            @RequestBody @Valid FeedbackRequestDto dto) {
        
        FeedbackResponseDto response = feedbackService.processFeedback(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}