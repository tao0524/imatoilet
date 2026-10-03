package com.imatoilet.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AdminEncodedPathTomcatTest {
    @LocalServerPort
    int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void embeddedTomcatProtectsEncodedAdminPathWithoutToken() throws Exception {
        assertThat(send(null).statusCode()).isEqualTo(401);
    }

    @Test
    void embeddedTomcatProtectsEncodedAdminPathWithInvalidToken() throws Exception {
        assertThat(send("wrong-token").statusCode()).isEqualTo(401);
    }

    @Test
    void embeddedTomcatAllowsEncodedAdminPathWithValidToken() throws Exception {
        assertThat(send("test-admin-token").statusCode()).isEqualTo(200);
    }

    private HttpResponse<String> send(String token) throws Exception {
        String body = """
                {
                  "dryRun": true,
                  "toilets": [{
                    "name": "Encoded path test",
                    "lat": 35.0,
                    "lng": 139.0,
                    "sourceKey": "osm",
                    "sourceExternalId": "node/999",
                    "sourceUrl": "https://www.openstreetmap.org/node/999"
                  }]
                }
                """;
        var builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/%61dmin/toilets/import-external"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        if (token != null) {
            builder.header("X-Admin-Token", token);
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }
}
