package com.imatoilet.backend;

import com.imatoilet.backend.config.FirebaseAuthFilter;
import com.imatoilet.backend.dto.MigrationRequestDto;
import com.imatoilet.backend.dto.UserResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
