package com.imatoilet.backend.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class AdminTokenFilterTest {

    private static final String ADMIN_TOKEN = "test-admin-token";

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

    @ParameterizedTest
    @CsvSource({
            "PUT, /api/toilets/1",
            "DELETE, /api/toilets/1",
            "POST, /api/admin/toilets/import"
    })
    void protectedRequestsWithoutTokenAreRejected(String method, String path) throws Exception {
        AdminTokenFilter filter = newFilter();
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());
        verify(chain, never()).doFilter(request, response);
    }

    @ParameterizedTest
    @CsvSource({
            "PUT, /api/toilets/1",
            "POST, /api/admin/toilets/import"
    })
    void protectedRequestsWithCorrectTokenProceed(String method, String path) throws Exception {
        AdminTokenFilter filter = newFilter();
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.addHeader("X-Admin-Token", ADMIN_TOKEN);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
    }

    @ParameterizedTest
    @CsvSource({
            "GET, /api/toilets",
            "POST, /api/toilets",
            "POST, /api/toilets/1/reviews"
    })
    void publicRequestsWithoutTokenProceed(String method, String path) throws Exception {
        AdminTokenFilter filter = newFilter();
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
    }

    @Test
    void legacyEditPathIsNoLongerExemptFromProtection() throws Exception {
        AdminTokenFilter filter = newFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("PUT", "/api/toilets/1/edit");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());
        verify(chain, never()).doFilter(request, response);
    }

    private AdminTokenFilter newFilter() {
        AdminTokenFilter filter = new AdminTokenFilter();
        ReflectionTestUtils.setField(filter, "adminToken", ADMIN_TOKEN);
        return filter;
    }
}
