package com.imatoilet.backend.config;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FirebaseAuthFilterTest {

    private final FirebaseAuthFilter filter = new FirebaseAuthFilter();

    @Test
    void rejectsBearerWhenFirebaseIsNotInitialized() throws Exception {
        MockHttpServletRequest request = requestWithAuthorization("Bearer arbitrary-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        try (MockedStatic<FirebaseApp> firebaseApp = mockStatic(FirebaseApp.class)) {
            firebaseApp.when(FirebaseApp::getApps).thenReturn(List.of());

            filter.doFilter(request, response, chain);
        }

        assertEquals(503, response.getStatus());
        assertNull(request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR));
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void rejectsEmptyBearerToken() throws Exception {
        MockHttpServletRequest request = requestWithAuthorization("Bearer ");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertNull(request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR));
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void rejectsInvalidBearerWhenFirebaseIsInitialized() throws Exception {
        MockHttpServletRequest request = requestWithAuthorization("Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);
        FirebaseAuth firebaseAuth = mock(FirebaseAuth.class);
        FirebaseAuthException verificationFailure = mock(FirebaseAuthException.class);

        when(firebaseAuth.verifyIdToken("invalid-token")).thenThrow(verificationFailure);

        try (MockedStatic<FirebaseApp> firebaseApp = mockStatic(FirebaseApp.class);
             MockedStatic<FirebaseAuth> firebaseAuthStatic = mockStatic(FirebaseAuth.class)) {
            firebaseApp.when(FirebaseApp::getApps).thenReturn(List.of(mock(FirebaseApp.class)));
            firebaseAuthStatic.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);

            filter.doFilter(request, response, chain);
        }

        assertEquals(401, response.getStatus());
        assertNull(request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR));
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void passesThroughWithoutAuthorizationHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        assertNull(request.getAttribute(FirebaseAuthFilter.FIREBASE_UID_ATTR));
        verify(chain).doFilter(request, response);
    }

    private MockHttpServletRequest requestWithAuthorization(String value) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", value);
        return request;
    }
}
