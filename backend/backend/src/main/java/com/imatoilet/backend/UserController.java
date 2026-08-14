package com.imatoilet.backend;

import com.imatoilet.backend.config.FirebaseAuthFilter;
import com.imatoilet.backend.dto.AchievementResponseDto;
import com.imatoilet.backend.dto.EnhanceRequestDto;
import com.imatoilet.backend.dto.EquipmentRequestDto;
import com.imatoilet.backend.dto.EvolveRequestDto;
import com.imatoilet.backend.dto.GameDataResponseDto;
import com.imatoilet.backend.dto.GameEquipmentRequestDto;
import com.imatoilet.backend.dto.InventoryResponseDto;
import com.imatoilet.backend.dto.MigrationRequestDto;
import com.imatoilet.backend.dto.StoryProgressRequestDto;
import com.imatoilet.backend.dto.StoryProgressResponseDto;
import com.imatoilet.backend.dto.UserResponseDto;
import com.imatoilet.backend.dto.ItemCraftRequestDto;
import com.imatoilet.backend.dto.ItemUseRequestDto;
import com.imatoilet.backend.dto.ItemUseResponseDto;
import com.imatoilet.backend.dto.StoryEvolveRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    private final BattleService battleService;
    private final StoryService storyService;
    private final EnhanceService enhanceService;
    private final EvolveService evolveService;
    private final StoryEvolveService storyEvolveService;
    private final ItemService itemService;
    private final UserRepository userRepository;

    public UserController(UserService userService,
                          AchievementService achievementService,
                          InventoryService inventoryService,
                          BattleService battleService,
                          StoryService storyService,
                          EnhanceService enhanceService,
                          EvolveService evolveService,
                          StoryEvolveService storyEvolveService,
                          ItemService itemService,
                          UserRepository userRepository) {
        this.userService = userService;
        this.achievementService = achievementService;
        this.inventoryService = inventoryService;
        this.battleService = battleService;
        this.storyService = storyService;
        this.enhanceService = enhanceService;
        this.evolveService = evolveService;
        this.storyEvolveService = storyEvolveService;
        this.itemService = itemService;
        this.userRepository = userRepository;
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

    @PutMapping("/me/game-equipment")
    public ResponseEntity<GameDataResponseDto> updateGameEquipment(
            HttpServletRequest request,
            @Valid @RequestBody GameEquipmentRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        GameDataResponseDto response = battleService.updateWeaponAttribute(userId, body.getWeaponAttribute());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/game-equipment/enhance")
    public ResponseEntity<GameDataResponseDto> enhanceEquipment(
            HttpServletRequest request,
            @Valid @RequestBody EnhanceRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        GameDataResponseDto response = enhanceService.enhance(userId, body);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/game-equipment/evolve")
    public ResponseEntity<GameDataResponseDto> evolveEquipment(
            HttpServletRequest request,
            @Valid @RequestBody EvolveRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        GameDataResponseDto response = evolveService.evolve(userId, body);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/game-equipment/story-evolve")
    public ResponseEntity<GameDataResponseDto> storyEvolve(
            HttpServletRequest request,
            @Valid @RequestBody StoryEvolveRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        GameDataResponseDto response = storyEvolveService.storyEvolve(userId, body);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/game-data")
    public ResponseEntity<GameDataResponseDto> getGameData(HttpServletRequest request) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        GameDataResponseDto response = battleService.getGameData(userId);
        return ResponseEntity.ok(response);
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

    @PostMapping("/me/story-progress")
    public ResponseEntity<StoryProgressResponseDto> advanceStory(
            HttpServletRequest request,
            @Valid @RequestBody StoryProgressRequestDto body) {
        String userId = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            StoryProgressResponseDto response = storyService.advanceStory(userId, body);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/me/items/craft")
    public ResponseEntity<GameDataResponseDto> craftItem(
            @Valid @RequestBody ItemCraftRequestDto request,
            HttpServletRequest httpRequest) {
        String uid = (String) httpRequest.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        itemService.craft(uid, request.getItemKey(), request.getCrystalAttribute(), request.getCount());
        return ResponseEntity.ok(battleService.getGameData(uid));
    }

    @PostMapping("/me/items/use")
    public ResponseEntity<ItemUseResponseDto> useItem(
            @Valid @RequestBody ItemUseRequestDto request,
            HttpServletRequest httpRequest) {
        String uid = (String) httpRequest.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        int newQty = itemService.use(uid, request.getItemKey());
        return ResponseEntity.ok(new ItemUseResponseDto(request.getItemKey(), newQty));
    }

    // ★★★ テスト用：ストーリーリセット（テスト完了後に必ず削除）★★★
    @PostMapping("/me/story-reset")
    public ResponseEntity<?> resetStoryProgress(
            @RequestBody java.util.Map<String, Object> body,
            HttpServletRequest request) {
        String uid = (String) request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (body.containsKey("storyChapter")) {
            user.setStoryChapter(((Number) body.get("storyChapter")).intValue());
        }
        if (body.containsKey("storyScene")) {
            user.setStoryScene(((Number) body.get("storyScene")).intValue());
        }
        if (body.containsKey("heldDoorEnemyId")) {
            Object val = body.get("heldDoorEnemyId");
            user.setHeldDoorEnemyId(val == null ? null : val.toString());
        }

        userRepository.save(user);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("storyChapter", user.getStoryChapter());
        result.put("storyScene", user.getStoryScene());
        result.put("heldDoorEnemyId", user.getHeldDoorEnemyId());
        return ResponseEntity.ok(result);
    }
}
