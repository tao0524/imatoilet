package com.imatoilet.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.postgresql.util.PSQLException;
import org.postgresql.util.ServerErrorMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ExternalToiletImportRollbackTest {
    @Autowired MockMvc mockMvc;
    @MockitoSpyBean ToiletRepository toiletRepository;

    @MockitoSpyBean EquipmentRepository equipmentRepository;

    @BeforeEach
    void setUp() {
        toiletRepository.deleteAll();
    }

    @Test
    void equipmentSaveFailureRollsBackToilet() throws Exception {
        doThrow(new IllegalStateException("simulated equipment failure"))
                .when(equipmentRepository).saveAll(anyList());

        String body = """
                {
                  "dryRun": false,
                  "toilets": [{
                    "name": "Rollback",
                    "lat": 35.0,
                    "lng": 139.0,
                    "sourceKey": "osm",
                    "sourceExternalId": "node/900",
                    "equipment": ["WHEELCHAIR"]
                  }]
                }
                """;

        mockMvc.perform(post("/api/admin/toilets/import-external")
                        .header("X-Admin-Token", "test-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isInternalServerError());

        assertThat(toiletRepository.count()).isZero();
        assertThat(equipmentRepository.count()).isZero();
    }

    @Test
    void hibernateExternalIdentityUniqueConflictStillReturns409AndRollsBack() throws Exception {
        var constraint = mock(org.hibernate.exception.ConstraintViolationException.class);
        when(constraint.getConstraintName()).thenReturn("uq_toilet_external_identity");
        doThrow(new DataIntegrityViolationException("duplicate external identity", constraint))
                .when(toiletRepository).flush();

        mockMvc.perform(post("/api/admin/toilets/import-external")
                        .header("X-Admin-Token", "test-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("node/901")))
                .andExpect(status().isConflict())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .jsonPath("$.message").value(org.hamcrest.Matchers.containsString("dry-run")));

        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void psqlUniqueViolationWithExternalIdentityConstraintReturns409AndRollsBack() throws Exception {
        doThrow(dataIntegrityViolation("23505", "uq_toilet_external_identity"))
                .when(toiletRepository).flush();

        mockMvc.perform(post("/api/admin/toilets/import-external")
                        .header("X-Admin-Token", "test-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("node/902")))
                .andExpect(status().isConflict())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .jsonPath("$.message").value(org.hamcrest.Matchers.containsString("dry-run")));

        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void psqlUniqueViolationForOtherConstraintRemains500() throws Exception {
        doThrow(dataIntegrityViolation("23505", "uq_equipment_toilet_type"))
                .when(toiletRepository).flush();

        mockMvc.perform(post("/api/admin/toilets/import-external")
                        .header("X-Admin-Token", "test-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("node/903")))
                .andExpect(status().isInternalServerError());

        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void psqlNonUniqueViolationForExternalIdentityConstraintRemains500() throws Exception {
        doThrow(dataIntegrityViolation("23503", "uq_toilet_external_identity"))
                .when(toiletRepository).flush();

        mockMvc.perform(post("/api/admin/toilets/import-external")
                        .header("X-Admin-Token", "test-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("node/904")))
                .andExpect(status().isInternalServerError());

        assertThat(toiletRepository.count()).isZero();
    }

    @Test
    void unrelatedConstraintViolationRemains500() throws Exception {
        var constraint = mock(org.hibernate.exception.ConstraintViolationException.class);
        when(constraint.getConstraintName()).thenReturn("uq_equipment_toilet_type");
        doThrow(new DataIntegrityViolationException("other constraint", constraint))
                .when(toiletRepository).flush();

        mockMvc.perform(post("/api/admin/toilets/import-external")
                        .header("X-Admin-Token", "test-admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("node/902")))
                .andExpect(status().isInternalServerError());

        assertThat(toiletRepository.count()).isZero();
    }

    private DataIntegrityViolationException dataIntegrityViolation(String sqlState, String constraintName) {
        ServerErrorMessage serverError = new ServerErrorMessage(
                "SERROR\0C" + sqlState
                        + "\0M重複キー値は一意性制約に違反しています"
                        + "\0n" + constraintName + "\0\0");
        PSQLException psql = new PSQLException(serverError);
        var hibernate = new org.hibernate.exception.ConstraintViolationException(
                "could not execute statement", psql, (String) null);
        return new DataIntegrityViolationException("database constraint violation", hibernate);
    }

    private String validBody(String externalId) {
        return """
                {
                  "dryRun": false,
                  "toilets": [{
                    "name": "Constraint test",
                    "lat": 35.0,
                    "lng": 139.0,
                    "sourceKey": "osm",
                    "sourceExternalId": "%s"
                  }]
                }
                """.formatted(externalId);
    }
}
