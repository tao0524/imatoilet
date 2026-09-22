package com.imatoilet.backend.exception;

import com.imatoilet.backend.ToiletService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Spring MVC標準例外(NoResourceFoundException / MethodArgumentTypeMismatchException)が
// GlobalExceptionHandlerで正しいHTTP statusに変換されることを、実際のHTTPリクエスト経路で検証する。
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ToiletService toiletService;

    @Test
    void shouldReturn404ForCompletelyUndefinedPath() throws Exception {
        mockMvc.perform(get("/api/definitely-not-existing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", is("リソースが見つかりません")))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.path", containsString("/api/definitely-not-existing")));
    }

    @Test
    void shouldReturn404ForTrailingSlashPath() throws Exception {
        mockMvc.perform(get("/api/toilets/"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", is("リソースが見つかりません")));
    }

    @Test
    void shouldReturn400ForNonNumericPathVariable() throws Exception {
        mockMvc.perform(get("/api/toilets/not-a-number"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", is("リクエストパラメータの形式が不正です")));
    }

    @Test
    void shouldReturn500AndHideDetailsForUnexpectedException() throws Exception {
        when(toiletService.getToilet(anyLong())).thenThrow(new RuntimeException("boom"));

        mockMvc.perform(get("/api/toilets/123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status", is(500)))
                .andExpect(jsonPath("$.message", is("予期せぬエラーが発生しました")))
                .andExpect(content().string(not(containsString("boom"))));
    }
}
