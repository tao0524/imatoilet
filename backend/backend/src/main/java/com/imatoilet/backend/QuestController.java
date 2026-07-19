package com.imatoilet.backend;

import com.imatoilet.backend.config.FirebaseAuthFilter;
import com.imatoilet.backend.dto.DailyQuestResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quests")
public class QuestController {

    private final DailyQuestService dailyQuestService;

    public QuestController(DailyQuestService dailyQuestService) {
        this.dailyQuestService = dailyQuestService;
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyQuestResponseDto> getDailyQuests(HttpServletRequest request) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        DailyQuestResponseDto response = dailyQuestService.getDailyQuests(userId);
        return ResponseEntity.ok(response);
    }
}
