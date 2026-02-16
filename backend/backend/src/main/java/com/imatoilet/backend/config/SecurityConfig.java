package com.imatoilet.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // CORS設定で使用するため、これらはコメントアウトせずに残します
    @Value("${app.cors.allowed-origins:http://localhost:4173,http://localhost:5173}")
    private String allowedOrigins;

    @Value("${app.cors.allow-credentials:false}")
    private boolean allowCredentials;

    // 将来の認証用（現在は使用しないためコメントアウト）
    // @Value("${app.admin.username}")
    // private String adminUsername;

    // @Value("${app.admin.password}")
    // private String adminPassword;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS設定を適用
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // CSRF無効化 (REST APIのため)
            .csrf(csrf -> csrf.disable())
            // セッション管理をステートレスに
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // アクセス制御
            .authorizeHttpRequests(auth -> auth
                // 開発用：全APIを開放
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/error").permitAll()
                // それ以外は拒否
                .anyRequest().denyAll()
            );

        return http.build();
    }

    /* 将来の認証用（現在は使用しないためコメントアウト）
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin = User.builder()
                .username(adminUsername)
                .password(passwordEncoder().encode(adminPassword))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    */

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origins設定
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        configuration.setAllowedOrigins(List.of(origins));
        
        // メソッド・ヘッダー設定
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}