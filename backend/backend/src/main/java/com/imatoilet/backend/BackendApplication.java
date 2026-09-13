package com.imatoilet.backend;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) throws NoSuchAlgorithmException {
		String dbPassword = System.getenv("DB_PASSWORD");
		String expectedPassword = System.getenv("DB_PASSWORD_EXPECTED");
		System.out.printf(
			"DB_PASSWORD_DIAG dbPresent=%s dbLength=%d expectedPresent=%s expectedLength=%d same=%s%n",
			dbPassword != null,
			dbPassword == null ? -1 : dbPassword.length(),
			expectedPassword != null,
			expectedPassword == null ? -1 : expectedPassword.length(),
			dbPassword != null && expectedPassword != null && dbPassword.equals(expectedPassword)
		);
		if (dbPassword == null) {
			System.out.println("DB_PASSWORD_FINGERPRINT unavailable");
		} else {
			byte[] sha256 = MessageDigest.getInstance("SHA-256")
				.digest(dbPassword.getBytes(StandardCharsets.UTF_8));
			String sha256Prefix = HexFormat.of().formatHex(sha256, 0, 6);
			System.out.println("DB_PASSWORD_FINGERPRINT sha256Prefix=" + sha256Prefix);
		}
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner temporaryDataInitializer(JdbcTemplate jdbcTemplate) {
		return args -> {
			System.out.println("=== [RAILWAY MIGRATION] Executing SQL updates... ===");
			
			// 1. users テーブルの weapon_enhancement を 3 に、purify_stone を 5 に更新
			try {
				int usersUpdated = jdbcTemplate.update(
					"UPDATE users SET weapon_enhancement = 3, purify_stone = 5"
				);
				System.out.println(">>> Updated users table: " + usersUpdated + " row(s)");
			} catch (Exception e) {
				System.err.println(">>> Error updating users table: " + e.getMessage());
			}

			// 2. user_inventory テーブルの 4種類の結晶の quantity を 50 に更新
			try {
				int invUpdated = jdbcTemplate.update(
					"UPDATE user_inventory SET quantity = 50 WHERE material_key IN ('crystal_nature', 'crystal_steel', 'crystal_pure', 'crystal_chaos')"
				);
				System.out.println(">>> Updated user_inventory table: " + invUpdated + " row(s)");
			} catch (Exception e) {
				System.err.println(">>> Error updating user_inventory table: " + e.getMessage());
			}

			System.out.println("=== [RAILWAY MIGRATION] Completed SQL updates. ===");
		};
	}
}
