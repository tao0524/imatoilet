package com.imatoilet.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AdminTokenFilterTest {

    @Test
    void rejectsMissingOrBlankAdminToken() {
        for (String value : new String[] { null, "", "   " }) {
            AdminTokenFilter filter = new AdminTokenFilter();
            ReflectionTestUtils.setField(filter, "adminToken", value);

            assertThrows(IllegalStateException.class, filter::validateAdminToken);
        }
    }

    @Test
    void acceptsConfiguredAdminToken() {
        AdminTokenFilter filter = new AdminTokenFilter();
        ReflectionTestUtils.setField(filter, "adminToken", "configured-test-token");

        assertDoesNotThrow(filter::validateAdminToken);
    }
}
