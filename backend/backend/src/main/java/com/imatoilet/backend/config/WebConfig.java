package com.imatoilet.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties の app.cors.allowed-origins を参照
    @Value("${app.cors.allowed-origins:http://localhost:4173,http://localhost:5173}")
    private String allowedOrigins;

    // Cookie/認証情報を送る必要がある場合だけ true
    @Value("${app.cors.allow-credentials:false}")
    private boolean allowCredentials;

    // 修正3: SecurityConfigにCORS設定を移管したため、
    // ここでの addCorsMappings 設定は削除（無効化）しました。
    // SecurityConfig.java 側でCORS設定が一括管理されます。

}