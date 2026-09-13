package com.imatoilet.backend;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
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
		String dbUrl = System.getenv("DB_URL");
		String dbUser = System.getenv("DB_USER");
		if (dbUrl == null) {
			System.out.println("DB_TARGET_FINGERPRINT unavailable reason=db_url_missing");
		} else if (dbUser == null || dbUser.isEmpty()) {
			System.out.println("DB_TARGET_FINGERPRINT unavailable reason=db_user_missing");
		} else if (!dbUrl.startsWith("jdbc:postgresql://")) {
			System.out.println("DB_TARGET_FINGERPRINT unavailable reason=invalid_format");
		} else {
			try {
				URI dbUri = new URI(dbUrl.substring("jdbc:".length()));
				String host = dbUri.getHost();
				int port = dbUri.getPort();
				String path = dbUri.getPath();
				if (host == null || host.isEmpty()) {
					System.out.println("DB_TARGET_FINGERPRINT unavailable reason=host_missing");
				} else if (port < 0) {
					System.out.println("DB_TARGET_FINGERPRINT unavailable reason=port_missing");
				} else if (path == null || path.length() <= 1) {
					System.out.println("DB_TARGET_FINGERPRINT unavailable reason=database_missing");
				} else {
					String database = path.substring(1);
					String target = host + "|" + port + "|" + database + "|" + dbUser;
					byte[] sha256 = MessageDigest.getInstance("SHA-256")
						.digest(target.getBytes(StandardCharsets.UTF_8));
					String sha256Prefix = HexFormat.of().formatHex(sha256, 0, 6);
					System.out.println("DB_TARGET_FINGERPRINT sha256Prefix=" + sha256Prefix);
				}
			} catch (URISyntaxException e) {
				System.out.println("DB_TARGET_FINGERPRINT unavailable reason=parse_error");
			}
		}
		boolean argUrl = Arrays.stream(args).anyMatch(arg -> arg.startsWith("--spring.datasource.url="));
		boolean argUsername = Arrays.stream(args).anyMatch(arg -> arg.startsWith("--spring.datasource.username="));
		boolean argPassword = Arrays.stream(args).anyMatch(arg -> arg.startsWith("--spring.datasource.password="));
		boolean argProfiles = Arrays.stream(args).anyMatch(arg -> arg.startsWith("--spring.profiles.active="));
		System.out.printf(
			"RUNTIME_OVERRIDE_ENV envUrl=%s envUsername=%s envPassword=%s envApplicationJson=%s envProfiles=%s%n",
			System.getenv("SPRING_DATASOURCE_URL") != null,
			System.getenv("SPRING_DATASOURCE_USERNAME") != null,
			System.getenv("SPRING_DATASOURCE_PASSWORD") != null,
			System.getenv("SPRING_APPLICATION_JSON") != null,
			System.getenv("SPRING_PROFILES_ACTIVE") != null
		);
		System.out.printf(
			"RUNTIME_OVERRIDE_SYS sysUrl=%s sysUsername=%s sysPassword=%s sysProfiles=%s%n",
			System.getProperty("spring.datasource.url") != null,
			System.getProperty("spring.datasource.username") != null,
			System.getProperty("spring.datasource.password") != null,
			System.getProperty("spring.profiles.active") != null
		);
		System.out.printf(
			"RUNTIME_OVERRIDE_ARGS argUrl=%s argUsername=%s argPassword=%s argProfiles=%s%n",
			argUrl,
			argUsername,
			argPassword,
			argProfiles
		);
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
