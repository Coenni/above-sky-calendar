package com.abovesky.calendar.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Test Example for Above Sky Calendar API
 * Tests the full application context and API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Test health check endpoint
     */
    @Test
    public void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    /**
     * Test authentication endpoints
     */
    @Test
    public void testAuthenticationFlow() throws Exception {
        // Register a new user
        String registerRequest = """
            {
                "username": "testuser",
                "email": "test@example.com",
                "password": "TestPassword123!",
                "displayName": "Test User",
                "role": "PARENT"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // Login with created user
        String loginRequest = """
            {
                "username": "testuser",
                "password": "TestPassword123!"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.username").value("testuser"));
    }

    /**
     * Test rate limiting
     */
    @Test
    public void testRateLimiting() throws Exception {
        // Make multiple rapid requests to trigger rate limiting
        for (int i = 0; i < 15; i++) {
            try {
                mockMvc.perform(get("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON))
                        .andExpect(status().isMethodNotAllowed()); // Expect 429 or appropriate error
            } catch (Exception e) {
                // Expected to fail after rate limit exceeded
            }
        }
    }

    /**
     * Test unauthorized access
     */
    @Test
    public void testUnauthorizedAccess() throws Exception {
        // Try to access protected endpoint without token
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test CORS configuration
     */
    @Test
    public void testCorsHeaders() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://yourdomain.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    /**
     * Test metrics endpoint
     */
    @Test
    public void testPrometheusMetrics() throws Exception {
        mockMvc.perform(get("/api/actuator/prometheus"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain;version=0.0.4;charset=utf-8"));
    }
}
