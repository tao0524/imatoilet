package com.imatoilet.backend.config;

import java.util.Arrays;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties の app.cors.allowed-origins を参照
    @Value("${app.cors.allowed-origins:http://localhost:4173,http://localhost:5173}")
    private String allowedOrigins;

    // Cookie/認証情報を送る必要がある場合だけ true
    @Value("${app.cors.allow-credentials:false}")
    private boolean allowCredentials;

    @Override
    @SuppressWarnings("null") // コンパイラのNull警告を抑制（Stream処理の配列変換等で発生するため）
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        System.out.println("[CORS] addCorsMappings called. allowedOrigins=" + allowedOrigins);
        // 安全対策: nullの場合は空文字扱いにする
        String safeOrigins = Objects.requireNonNullElse(allowedOrigins, "");

        String[] origins = Arrays.stream(safeOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        // APIだけに適用
        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(allowCredentials)
                .maxAge(3600);
    }
}