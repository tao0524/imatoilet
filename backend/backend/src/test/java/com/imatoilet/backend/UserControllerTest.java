package com.imatoilet.backend;

import com.imatoilet.backend.dto.ItemCraftRequestDto;
import com.imatoilet.backend.dto.ItemUseRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class UserControllerTest {

    private final UserService userService = mock(UserService.class);
    private final AchievementService achievementService = mock(AchievementService.class);
    private final InventoryService inventoryService = mock(InventoryService.class);
    private final BattleService battleService = mock(BattleService.class);
    private final StoryService storyService = mock(StoryService.class);
    private final EnhanceService enhanceService = mock(EnhanceService.class);
    private final EvolveService evolveService = mock(EvolveService.class);
    private final StoryEvolveService storyEvolveService = mock(StoryEvolveService.class);
    private final ItemService itemService = mock(ItemService.class);
    private final UserController controller = new UserController(
            userService,
            achievementService,
            inventoryService,
            battleService,
            storyService,
            enhanceService,
            evolveService,
            storyEvolveService,
            itemService);

    @Test
    void craftItemReturnsUnauthorizedWithoutFirebaseUid() {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        var response = controller.craftItem(mock(ItemCraftRequestDto.class), httpRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(itemService, battleService);
    }

    @Test
    void useItemReturnsUnauthorizedWithoutFirebaseUid() {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        var response = controller.useItem(mock(ItemUseRequestDto.class), httpRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(itemService);
    }
}
