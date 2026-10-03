package com.imatoilet.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.net.URI;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.closeTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ExternalToiletImportApiTest {
    private static final String URL = "/api/admin/toilets/import-external";
    private static final String TOKEN = "test-admin-token";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired ToiletRepository toiletRepository;
    @Autowired EquipmentRepository equipmentRepository;

    @BeforeEach
    void setUp() {
        toiletRepository.deleteAll();
    }

    @Test
    void insertsWithNullCleanlinessExternalIdentityAndDeduplicatedEquipment() throws Exception {
        MvcResult mvcResult = importExternal(request(false, item("node/100", 35.0, 139.0,
                false, "\"equipment\":[\"WHEELCHAIR\",\"WHEELCHAIR\"]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].inputIndex", is(0)))
                .andExpect(jsonPath("$.results[0].status", is("INSERTED")))
                .andReturn();

        Long id = objectMapper.readTree(mvcResult.getResponse().getContentAsString())
                .path("results").get(0).path("existingToiletId").asLong();
        Toilet saved = toiletRepository.findById(id).orElseThrow();
        assertThat(saved.getCleanliness()).isNull();
        assertThat(saved.getSourceKey()).isEqualTo("osm");
        assertThat(saved.getSourceExternalId()).isEqualTo("node/100");
        assertThat(equipmentRepository.findByToilet_Id(id))
                .extracting(Equipment::getType)
                .containsExactly(EquipmentType.WHEELCHAIR);
    }

    @Test
    void sameExternalIdIsNeverInsertedTwiceEvenWhenCoordinatesMoveMoreThanFiftyMeters() throws Exception {
        importExternal(request(false, item("node/200", 35.0, 139.0, false, "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("INSERTED")));

        importExternal(request(false, item("node/200", 35.0, 139.0, false, "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("ALREADY_IMPORTED")));

        importExternal(request(false, item("node/200", 36.0, 140.0, true, "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("ALREADY_IMPORTED")));

        assertThat(toiletRepository.count()).isOne();
    }

    @Test
    void differentExternalIdWithinFiftyMetersIsConflictAndNotSaved() throws Exception {
        Toilet existing = toilet("Existing", 35.0, 139.0);
        toiletRepository.save(existing);

        importExternal(request(false, item("node/301", 35.0001, 139.0, false, "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("NEARBY_CONFLICT")))
                .andExpect(jsonPath("$.results[0].existingToiletId", is(existing.getId().intValue())))
                .andExpect(jsonPath("$.results[0].distanceMeters", closeTo(11.1, 0.5)));

        assertThat(toiletRepository.count()).isOne();
    }

    @Test
    void allowNearbyDistinctInsertsOnlyWhenExternalIdDiffers() throws Exception {
        Toilet existing = toilet("Existing", 35.0, 139.0);
        existing.setSourceKey("osm");
        existing.setSourceExternalId("node/400");
        toiletRepository.save(existing);

        importExternal(request(false, item("node/401", 35.0001, 139.0, true, "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("INSERTED")));
        importExternal(request(false, item("node/400", 36.0, 140.0, true, "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("ALREADY_IMPORTED")));

        assertThat(toiletRepository.count()).isEqualTo(2);
    }

    @Test
    void duplicateExternalIdWithinRequestReturns400AndSavesNothing() throws Exception {
        String first = item("node/500", 35.0, 139.0, false, "");
        String duplicate = item("node/500", 36.0, 140.0, false, "");

        importExternal(request(false, first + "," + duplicate))
                .andExpect(status().isBadRequest());

        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void dryRunUsesSameDecisionAndDoesNotPersistToiletOrEquipment() throws Exception {
        importExternal(request(true, item("node/600", 35.0, 139.0, false,
                "\"equipment\":[\"WHEELCHAIR\"]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dryRun", is(true)))
                .andExpect(jsonPath("$.results[0].status", is("READY")));

        assertThat(toiletRepository.count()).isZero();
        assertThat(equipmentRepository.count()).isZero();
    }

    @Test
    void unknownEquipmentReturns400AndSavesNothing() throws Exception {
        importExternal(request(false, item("node/700", 35.0, 139.0, false,
                "\"equipment\":[\"WHEELCHAIR\",\"UNKNOWN\"]")))
                .andExpect(status().isBadRequest());

        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void adminTokenIsRequired() throws Exception {
        mockMvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(true, item("node/800", 35.0, 139.0, false, ""))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post(URL)
                        .header("X-Admin-Token", "wrong-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(true, item("node/800", 35.0, 139.0, false, ""))))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "wrong-token"})
    void encodedAdminPathWithoutValidTokenIsRejected(String token) throws Exception {
        var requestBuilder = post(URI.create("/api/%61dmin/toilets/import-external"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(true, item("node/801", 35.0, 139.0, false, "")));
        if (!token.isEmpty()) {
            requestBuilder.header("X-Admin-Token", token);
        }
        mockMvc.perform(requestBuilder)
                .andExpect(status().isUnauthorized());
    }

    @Test
    void encodedAdminPathWithValidTokenIsAccepted() throws Exception {
        mockMvc.perform(post(URI.create("/api/%61dmin/toilets/import-external"))
                        .header("X-Admin-Token", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(true, item("node/802", 35.0, 139.0, false, ""))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].status", is("READY")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"NODE/123", "Node/123", "node/0123", "node/0", "node/-1", "node/123/", " node/123 ", "node /123"})
    void nonCanonicalOsmExternalIdReturns400(String externalId) throws Exception {
        importExternal(request(false, customItem("osm", externalId,
                        "https://www.openstreetmap.org/node/123")))
                .andExpect(status().isBadRequest());
        assertThat(toiletRepository.count()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"OSM", " osm ", "osm-test", "city-data"})
    void unsupportedSourceKeyReturns400(String sourceKey) throws Exception {
        importExternal(request(false, customItem(sourceKey, "node/123",
                        "https://www.openstreetmap.org/node/123")))
                .andExpect(status().isBadRequest());
        assertThat(toiletRepository.count()).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://www.openstreetmap.org/node/124",
            "https://www.openstreetmap.org/node/123?x=1",
            "https://www.openstreetmap.org/node/123#map=1",
            "http://www.openstreetmap.org/node/123",
            "https://openstreetmap.org/node/123",
            "https://example.com/node/123",
            "https://www.openstreetmap.org/NODE/123",
            "https://www.openstreetmap.org/node/0123"
    })
    void nonCanonicalOrMismatchedOsmUrlReturns400(String sourceUrl) throws Exception {
        importExternal(request(false, customItem("osm", "node/123", sourceUrl)))
                .andExpect(status().isBadRequest());
        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void oneHundredItemsPassRequestValidation() throws Exception {
        importExternal(request(true, batchItems(100)))
                .andExpect(status().isOk());
    }

    @Test
    void oneHundredAndOneItemsReturn400() throws Exception {
        importExternal(request(true, batchItems(101)))
                .andExpect(status().isBadRequest());
        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void legacyImportStillDefaultsCleanlinessToThree() throws Exception {
        String json = """
                {"toilets":[{"name":"Legacy","lat":35.0,"lng":139.0,"source":"osm"}]}
                """;

        mockMvc.perform(post("/api/admin/toilets/import")
                        .header("X-Admin-Token", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inserted", is(1)));

        List<Toilet> saved = toiletRepository.findAll();
        assertThat(saved).hasSize(1);
        assertThat(saved.get(0).getCleanliness()).isEqualTo(3);
        assertThat(saved.get(0).getSourceKey()).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "wrong-token"})
    void legacyAdminImportRequiresValidToken(String token) throws Exception {
        var requestBuilder = post("/api/admin/toilets/import")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"toilets\":[]}");
        if (!token.isEmpty()) {
            requestBuilder.header("X-Admin-Token", token);
        }
        mockMvc.perform(requestBuilder).andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.ResultActions importExternal(String body) throws Exception {
        return mockMvc.perform(post(URL)
                .header("X-Admin-Token", TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private String request(boolean dryRun, String items) {
        return "{\"dryRun\":" + dryRun + ",\"toilets\":[" + items + "]}";
    }

    private String item(String externalId, double lat, double lng, boolean allowNearbyDistinct, String extra) {
        String suffix = extra.isBlank() ? "" : "," + extra;
        return "{\"name\":\"External\",\"lat\":" + lat + ",\"lng\":" + lng
                + ",\"source\":\"OpenStreetMap\",\"sourceUrl\":\"https://www.openstreetmap.org/" + externalId
                + "\",\"sourceKey\":\"osm\",\"sourceExternalId\":\"" + externalId
                + "\",\"allowNearbyDistinct\":" + allowNearbyDistinct + suffix + "}";
    }

    private String customItem(String sourceKey, String externalId, String sourceUrl) throws Exception {
        var item = objectMapper.createObjectNode();
        item.put("name", "External");
        item.put("lat", 35.0);
        item.put("lng", 139.0);
        item.put("sourceKey", sourceKey);
        item.put("sourceExternalId", externalId);
        item.put("sourceUrl", sourceUrl);
        return objectMapper.writeValueAsString(item);
    }

    private String batchItems(int count) {
        return IntStream.rangeClosed(1, count)
                .mapToObj(index -> item("node/" + index, 35.0, 139.0, false, ""))
                .collect(Collectors.joining(","));
    }

    private Toilet toilet(String name, double lat, double lng) {
        Toilet toilet = new Toilet();
        toilet.setName(name);
        toilet.setLat(lat);
        toilet.setLng(lng);
        return toilet;
    }
}
