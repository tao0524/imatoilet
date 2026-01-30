package com.imatoilet.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ToiletApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnListOfToilets() throws Exception {
        // APIを叩いて検証
        mockMvc.perform(get("/api/toilets"))
               // 1. ステータスコードが 200 (OK) であること
               .andExpect(status().isOk())
               // 2. コンテンツタイプが JSON であること
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               // 3. 返ってきたデータが「配列（リスト）」形式であること
               .andExpect(jsonPath("$").isArray()); 
    }
}