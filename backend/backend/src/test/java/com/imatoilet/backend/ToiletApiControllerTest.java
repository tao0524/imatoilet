package com.imatoilet.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class ToiletApiControllerTest {

    // ★追加: test/resources/application.properties の app.admin.token と一致させる
    private static final String VALID_TOKEN   = "test-admin-token";
    private static final String INVALID_TOKEN = "wrong-token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ToiletRepository toiletRepository;

    @BeforeEach
    void setUp() {
        toiletRepository.deleteAll();
    }

    // --- GET: 一覧取得 (変更なし) ---
    @Test
    void shouldReturnListOfToilets() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("Test Toilet");
        toilet.setLat(35.0);
        toilet.setLng(139.0);
        toilet.setAddress("Test Address");
        toilet.setDescription("Test Description");
        toilet.setCleanliness(5);
        
        toilet.addEquipment(EquipmentType.WHEELCHAIR);
        toilet.addEquipment(EquipmentType.DIAPER);
        
        toiletRepository.save(toilet);

        mockMvc.perform(get("/api/toilets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Test Toilet")))
                .andExpect(jsonPath("$[0].equipment", hasItem("WHEELCHAIR")))
                .andExpect(jsonPath("$[0].equipment", hasItem("DIAPER")));
    }

    // --- GET: ID指定取得 (変更なし) ---
    @Test
    void shouldReturnToiletById() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("Detail Test");
        toilet.setLat(36.0);
        toilet.setLng(140.0);
        toilet.addEquipment(EquipmentType.OPEN_24H); 
        
        Toilet saved = toiletRepository.save(toilet);

        mockMvc.perform(get("/api/toilets/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Detail Test")))
                .andExpect(jsonPath("$.equipment", hasItem("OPEN_24H")));
    }

    // --- POST: 新規登録 (変更なし: 認証不要のまま) ---
    @Test
    void shouldCreateToilet() throws Exception {
        String toiletJson = """
            {
                "name": "New Toilet",
                "lat": 35.123,
                "lng": 139.456,
                "address": "New Address",
                "description": "New Desc",
                "cleanliness": 4,
                "facilityCategory": "park",
                "equipment": ["WHEELCHAIR", "OPEN_24H"], 
                "image": "http://example.com/img.jpg"
            }
        """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toiletJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("New Toilet")))
                .andExpect(jsonPath("$.equipment", hasItems("WHEELCHAIR", "OPEN_24H")));
    }

    // --- PUT: 更新 (★ヘッダー追加) ---
    @Test
    void shouldUpdateToilet() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("Old Name");
        toilet.setLat(35.0);
        toilet.setLng(139.0);
        toilet.addEquipment(EquipmentType.DIAPER); 
        Toilet saved = toiletRepository.save(toilet);

        String updateJson = """
            {
                "name": "Updated Name",
                "lat": 35.0,
                "lng": 139.0,
                "equipment": ["WHEELCHAIR", "OSTOMATE"]
            }
        """;

        mockMvc.perform(put("/api/toilets/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson)
                .header("X-Admin-Token", VALID_TOKEN))   // ★追加
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")))
                .andExpect(jsonPath("$.equipment", hasSize(2)))
                .andExpect(jsonPath("$.equipment", hasItems("WHEELCHAIR", "OSTOMATE")));
    }

    // --- DELETE: 削除 (★ヘッダー追加) ---
    @Test
    void shouldDeleteToilet() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("To Delete");
        toilet.setLat(0.0);
        toilet.setLng(0.0);
        Toilet saved = toiletRepository.save(toilet);

        // 削除実行
        mockMvc.perform(delete("/api/toilets/" + saved.getId())
                .header("X-Admin-Token", VALID_TOKEN))   // ★追加
                .andExpect(status().isNoContent());

        // 削除後に取得して 404 になるか確認
        mockMvc.perform(get("/api/toilets/" + saved.getId()))
                .andExpect(status().isNotFound());
    }

    // ★新規追加: PUT に認証なし → 401 ---
    @Test
    void shouldReturn401WhenUpdatingWithoutToken() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("Auth Test");
        toilet.setLat(35.0);
        toilet.setLng(139.0);
        Toilet saved = toiletRepository.save(toilet);

        String updateJson = """
            { "name": "Hacked", "lat": 35.0, "lng": 139.0 }
        """;

        mockMvc.perform(put("/api/toilets/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))              // ヘッダーなし
                .andExpect(status().isUnauthorized());
    }

    // ★新規追加: DELETE に不正トークン → 401 ---
    @Test
    void shouldReturn401WhenDeletingWithInvalidToken() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("Auth Test");
        toilet.setLat(35.0);
        toilet.setLng(139.0);
        Toilet saved = toiletRepository.save(toilet);

        mockMvc.perform(delete("/api/toilets/" + saved.getId())
                .header("X-Admin-Token", INVALID_TOKEN))  // 不正トークン
                .andExpect(status().isUnauthorized());
    }

    // --- 以下は変更なし ---
    @Test
    void shouldReturn404ForNonExistentId() throws Exception {
        mockMvc.perform(get("/api/toilets/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturn400WhenNameIsBlank() throws Exception {
        String invalidJson = """
            { "name": "", "lat": 35.0, "lng": 139.0 }
        """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturn400WhenLatIsNull() throws Exception {
        String invalidJson = """
            { "name": "Valid Name", "lng": 139.0 }
        """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldAcceptMultipleImageUrls() throws Exception {
        String json = """
            {
                "name": "Multi Image",
                "lat": 35.0,
                "lng": 139.0,
                "image": "https://example.com/1.jpg,https://example.com/2.jpg"
            }
        """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.image", is("https://example.com/1.jpg,https://example.com/2.jpg")));
    }

    @Test
    void shouldReturn404WhenDeletingNonExistent() throws Exception {
        mockMvc.perform(delete("/api/toilets/9999")
                .header("X-Admin-Token", VALID_TOKEN))   // ★追加
                .andExpect(status().isNotFound());
    }
}