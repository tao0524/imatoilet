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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ToiletRepository toiletRepository;

    @BeforeEach
    void setUp() {
        // 各テスト実行前にデータをクリア
        toiletRepository.deleteAll();
    }

    // --- GET: 一覧取得 ---
    @Test
    void shouldReturnListOfToilets() throws Exception {
        // 1. テストデータ準備 (Repositoryに直接保存)
        Toilet toilet = new Toilet();
        toilet.setName("Test Toilet");
        toilet.setLat(35.0);
        toilet.setLng(139.0);
        toilet.setAddress("Test Address");
        toilet.setDescription("Test Description");
        toilet.setCleanliness(5);
        
        // ★変更点: CSV文字列ではなく、Entityのリレーションとして追加する
        toilet.addEquipment(EquipmentType.WHEELCHAIR);
        toilet.addEquipment(EquipmentType.DIAPER);
        
        toiletRepository.save(toilet);

        // 2. 検証
        mockMvc.perform(get("/api/toilets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Test Toilet")))
                // ★変更点: 配列の中に特定の文字列が含まれているかチェック
                .andExpect(jsonPath("$[0].equipment", hasItem("WHEELCHAIR")))
                .andExpect(jsonPath("$[0].equipment", hasItem("DIAPER")));
    }

    // --- GET: ID指定取得 ---
    @Test
    void shouldReturnToiletById() throws Exception {
        // 1. テストデータ準備
        Toilet toilet = new Toilet();
        toilet.setName("Detail Test");
        toilet.setLat(36.0);
        toilet.setLng(140.0);
        // ★変更点
        toilet.addEquipment(EquipmentType.OPEN_24H); 
        
        Toilet saved = toiletRepository.save(toilet);

        // 2. 検証
        mockMvc.perform(get("/api/toilets/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Detail Test")))
                // ★変更点: 配列の0番目が一致するか、または配列に含まれるか
                .andExpect(jsonPath("$.equipment", hasItem("OPEN_24H")));
    }

    // --- POST: 新規登録 ---
    @Test
    void shouldCreateToilet() throws Exception {
        // ★変更点: 送信JSONの equipment を配列にする
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
                // ★変更点: レスポンスの equipment 配列に2つとも含まれているか
                .andExpect(jsonPath("$.equipment", hasItems("WHEELCHAIR", "OPEN_24H")));
    }

    // --- PUT: 更新 ---
    @Test
    void shouldUpdateToilet() throws Exception {
        // 1. 元データ作成
        Toilet toilet = new Toilet();
        toilet.setName("Old Name");
        toilet.setLat(35.0);
        toilet.setLng(139.0);
        toilet.addEquipment(EquipmentType.DIAPER); // 元はDIAPERのみ
        Toilet saved = toiletRepository.save(toilet);

        // 2. 更新用JSON: equipment を更新
        // ★修正: バリデーション回避のため、lat, lng も含める必要があります
        String updateJson = """
            {
                "name": "Updated Name",
                "lat": 35.0,
                "lng": 139.0,
                "equipment": ["WHEELCHAIR", "OSTOMATE"]
            }
        """;

        // 3. 検証
        mockMvc.perform(put("/api/toilets/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk()) // これで200になるはず
                .andExpect(jsonPath("$.name", is("Updated Name")))
                // DIAPERが消え、新しい2つになっているかサイズと内容で確認
                .andExpect(jsonPath("$.equipment", hasSize(2)))
                .andExpect(jsonPath("$.equipment", hasItems("WHEELCHAIR", "OSTOMATE")));
    }

    // --- DELETE: 削除 ---
    @Test
    void shouldDeleteToilet() throws Exception {
        Toilet toilet = new Toilet();
        toilet.setName("To Delete");
        toilet.setLat(0.0);
        toilet.setLng(0.0);
        Toilet saved = toiletRepository.save(toilet);

        // 削除実行
        mockMvc.perform(delete("/api/toilets/" + saved.getId()))
                .andExpect(status().isNoContent());

        // 削除後に取得して 404 になるか確認
        mockMvc.perform(get("/api/toilets/" + saved.getId()))
                .andExpect(status().isNotFound());
    }

    // --- 異常系: 存在しないID ---
    @Test
    void shouldReturn404ForNonExistentId() throws Exception {
        mockMvc.perform(get("/api/toilets/9999"))
                .andExpect(status().isNotFound());
    }

    // --- バリデーション: 名前が空 ---
    @Test
    void shouldReturn400WhenNameIsBlank() throws Exception {
        String invalidJson = """
            {
                "name": "",
                "lat": 35.0,
                "lng": 139.0
            }
        """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // --- バリデーション: 緯度がnull ---
    @Test
    void shouldReturn400WhenLatIsNull() throws Exception {
        String invalidJson = """
            {
                "name": "Valid Name",
                "lng": 139.0
            }
        """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // --- 複数画像URLのテスト ---
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

    // --- 異常系: 存在しないIDの削除 ---
    @Test
    void shouldReturn404WhenDeletingNonExistent() throws Exception {
        mockMvc.perform(delete("/api/toilets/9999"))
                .andExpect(status().isNotFound());
    }
}