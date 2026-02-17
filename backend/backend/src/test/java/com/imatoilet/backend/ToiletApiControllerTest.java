package com.imatoilet.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ToiletApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // --- GET: 一覧取得 ---
    @Test
    void shouldReturnListOfToilets() throws Exception {
        mockMvc.perform(get("/api/toilets"))
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$").isArray());
    }

    // --- POST: 新規登録 → 201 ---
    @Test
    void shouldCreateToilet() throws Exception {
        String json = """
            {
                "name": "テスト用トイレ",
                "lat": 35.6812,
                "lng": 139.7671,
                "address": "東京都千代田区",
                "description": "テスト説明",
                "cleanliness": 4
            }
            """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").exists())
               .andExpect(jsonPath("$.name").value("テスト用トイレ"))
               .andExpect(jsonPath("$.cleanliness").value(4));
    }

    // --- POST: バリデーションエラー（名前が空）→ 400 ---
    @Test
    void shouldReturn400WhenNameIsBlank() throws Exception {
        String json = """
            {
                "name": "",
                "lat": 35.6812,
                "lng": 139.7671
            }
            """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
               .andExpect(status().isBadRequest());
    }

    // --- POST: バリデーションエラー（緯度が null）→ 400 ---
    @Test
    void shouldReturn400WhenLatIsNull() throws Exception {
        String json = """
            {
                "name": "テスト",
                "lng": 139.7671
            }
            """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
               .andExpect(status().isBadRequest());
    }

    // --- POST: 複数画像URL（カンマ区切り）→ 201 ---
    @Test
    void shouldAcceptMultipleImageUrls() throws Exception {
        String json = """
            {
                "name": "画像テスト",
                "lat": 35.0,
                "lng": 139.0,
                "image": "https://example.com/a.jpg,https://example.com/b.jpg"
            }
            """;

        mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.image").value("https://example.com/a.jpg,https://example.com/b.jpg"));
    }

    // --- GET: 存在するIDで取得 → 200 ---
    @Test
    void shouldReturnToiletById() throws Exception {
        // まず1件登録
        String json = """
            {
                "name": "ID検索テスト",
                "lat": 35.0,
                "lng": 139.0
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
               .andExpect(status().isCreated())
               .andReturn();

        // レスポンスからIDを取得
        String body = result.getResponse().getContentAsString();
        String idStr = body.split("\"id\":")[1].split("[,}]")[0].trim();

        // そのIDで取得
        mockMvc.perform(get("/api/toilets/" + idStr))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("ID検索テスト"));
    }

    // --- GET: 存在しないIDで404 ---
    @Test
    void shouldReturn404ForNonExistentId() throws Exception {
        mockMvc.perform(get("/api/toilets/99999"))
               .andExpect(status().isNotFound());
    }

    // --- PUT: 更新 → 200 ---
    @Test
    void shouldUpdateToilet() throws Exception {
        // まず1件登録
        String createJson = """
            {
                "name": "更新前の名前",
                "lat": 35.0,
                "lng": 139.0,
                "cleanliness": 2
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
               .andExpect(status().isCreated())
               .andReturn();

        String body = result.getResponse().getContentAsString();
        String idStr = body.split("\"id\":")[1].split("[,}]")[0].trim();

        // 更新
        String updateJson = """
            {
                "name": "更新後の名前",
                "lat": 35.0,
                "lng": 139.0,
                "cleanliness": 5
            }
            """;

        mockMvc.perform(put("/api/toilets/" + idStr)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("更新後の名前"))
               .andExpect(jsonPath("$.cleanliness").value(5));
    }

    // --- DELETE: 削除 → 204 ---
    @Test
    void shouldDeleteToilet() throws Exception {
        // まず1件登録
        String json = """
            {
                "name": "削除テスト",
                "lat": 35.0,
                "lng": 139.0
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/toilets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
               .andExpect(status().isCreated())
               .andReturn();

        String body = result.getResponse().getContentAsString();
        String idStr = body.split("\"id\":")[1].split("[,}]")[0].trim();

        // 削除
        mockMvc.perform(delete("/api/toilets/" + idStr))
               .andExpect(status().isNoContent());

        // 削除後に取得 → 404
        mockMvc.perform(get("/api/toilets/" + idStr))
               .andExpect(status().isNotFound());
    }

    // --- DELETE: 存在しないID → 404 ---
    @Test
    void shouldReturn404WhenDeletingNonExistent() throws Exception {
        mockMvc.perform(delete("/api/toilets/99999"))
               .andExpect(status().isNotFound());
    }
}