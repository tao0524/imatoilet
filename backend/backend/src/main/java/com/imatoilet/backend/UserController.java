package com.imatoilet.backend;

import com.imatoilet.backend.config.FirebaseAuthFilter;
import com.imatoilet.backend.dto.AchievementResponseDto;
import com.imatoilet.backend.dto.EquipmentRequestDto;
import com.imatoilet.backend.dto.InventoryResponseDto;
import com.imatoilet.backend.dto.MigrationRequestDto;
import com.imatoilet.backend.dto.UserResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AchievementService achievementService;
    private final InventoryService inventoryService;

    public UserController(UserService userService,
                          AchievementService achievementService,
                          InventoryService inventoryService) {
        this.userService = userService;
        this.achievementService = achievementService;
        this.inventoryService = inventoryService;
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

    @GetMapping("/me/achievements")
    public ResponseEntity<List<AchievementResponseDto>> getAchievements(HttpServletRequest request) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<AchievementResponseDto> achievements = achievementService.getUnlockedAchievements(userId);
        return ResponseEntity.ok(achievements);
    }

    @PutMapping("/me/title")
    public ResponseEntity<UserResponseDto> updateTitle(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String titleKey = body.get("activeTitle");
        try {
            UserResponseDto response = userService.updateTitle(userId, titleKey);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me/inventory")
    public ResponseEntity<List<InventoryResponseDto>> getInventory(HttpServletRequest request) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<InventoryResponseDto> inventory = inventoryService.getInventory(userId);
        return ResponseEntity.ok(inventory);
    }
}
