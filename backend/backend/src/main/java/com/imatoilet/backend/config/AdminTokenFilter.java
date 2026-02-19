package com.imatoilet.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * 管理者トークン認証フィルター
 *
 * PUT / DELETE リクエストに対して X-Admin-Token ヘッダーを要求する。
 * トークン値は環境変数 ADMIN_TOKEN で設定する（application.properties 経由）。
 *
 * 保護対象:  PUT, DELETE
 * 非保護対象: GET, POST (一般ユーザーのトイレ登録・検索は公開)
 */
@Component
public class AdminTokenFilter extends OncePerRequestFilter {

    /** 認証を要求するHTTPメソッドのセット */
    private static final Set<String> PROTECTED_METHODS = Set.of("PUT", "DELETE");

    @Value("${app.admin.token}")
    private String adminToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (PROTECTED_METHODS.contains(request.getMethod())) {
            String token = request.getHeader("X-Admin-Token");

            if (token == null || !token.equals(adminToken)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(
                    "{\"error\":\"認証が必要です。X-Admin-Token ヘッダーが不正または未指定です。\"}"
                );
                return; // フィルターチェーンを止める
            }
        }

        filterChain.doFilter(request, response);
    }
}