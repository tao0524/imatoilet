package com.imatoilet.backend;

import com.imatoilet.backend.config.FirebaseAuthFilter;
import com.imatoilet.backend.dto.BattleResultRequestDto;
import com.imatoilet.backend.dto.GameDataResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/battles")
public class BattleController {

    private final BattleService battleService;

    public BattleController(BattleService battleService) {
        this.battleService = battleService;
    }

    @PostMapping("/result")
    public ResponseEntity<GameDataResponseDto> submitResult(
            HttpServletRequest request,
            @Valid @RequestBody BattleResultRequestDto body) {
        String firebaseUid = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (firebaseUid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        GameDataResponseDto response = battleService.submitBattleResult(firebaseUid, body);
        return ResponseEntity.ok(response);
    }
}
