package com.imatoilet.backend;

import com.imatoilet.backend.config.FirebaseAuthFilter;
import com.imatoilet.backend.dto.EquipmentRequestDto;
import com.imatoilet.backend.dto.MigrationRequestDto;
import com.imatoilet.backend.dto.UserResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMe(HttpServletRequest request) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponseDto response = userService.getMe(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> migrateLocalData(
            HttpServletRequest request,
            @RequestBody MigrationRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponseDto response = userService.migrateLocalData(userId, body);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/equipment")
    public ResponseEntity<UserResponseDto> updateEquipment(
            HttpServletRequest request,
            @RequestBody EquipmentRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            UserResponseDto response = userService.updateEquipment(userId, body);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
