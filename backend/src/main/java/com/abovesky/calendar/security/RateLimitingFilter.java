package com.abovesky.calendar.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Filter to prevent API abuse
 * Implements token bucket algorithm per IP address
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Rate limiting configuration
    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final int AUTH_MAX_REQUESTS_PER_MINUTE = 10;
    
    // Store request counts per IP address
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    
    // Cleanup old entries periodically (in production, use scheduled task)
    private long lastCleanup = System.currentTimeMillis();
    private static final long CLEANUP_INTERVAL = 60000; // 1 minute

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String ipAddress = getClientIpAddress(request);
        String requestUri = request.getRequestURI();
        
        // Determine rate limit based on endpoint
        int maxRequests = isAuthEndpoint(requestUri) ? 
                         AUTH_MAX_REQUESTS_PER_MINUTE : 
                         MAX_REQUESTS_PER_MINUTE;
        
        // Get or create token bucket for this IP
        TokenBucket bucket = buckets.computeIfAbsent(ipAddress, 
                                                     k -> new TokenBucket(maxRequests));
        
        // Check if request is allowed
        if (!bucket.tryConsume()) {
            log.warn("Rate limit exceeded for IP: {} on endpoint: {}", ipAddress, requestUri);
            response.setStatus(429); // Too Many Requests
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("X-RateLimit-Reset", String.valueOf(bucket.getResetTime()));
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            response.setContentType("application/json");
            return;
        }
        
        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getRemaining()));
        
        // Cleanup old entries periodically
        cleanup();
        
        filterChain.doFilter(request, response);
    }

    /**
     * Check if the endpoint is an authentication endpoint requiring stricter limits
     */
    private boolean isAuthEndpoint(String uri) {
        return uri.contains("/api/auth/login") || 
               uri.contains("/api/auth/register") ||
               uri.contains("/api/auth/refresh-token") ||
               uri.contains("/api/auth/reset-password");
    }

    /**
     * Get the client's real IP address, considering proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Get the first IP in the chain (client IP)
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Cleanup old entries to prevent memory leaks
     */
    private void cleanup() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL) {
            buckets.entrySet().removeIf(entry -> entry.getValue().isExpired(now));
            lastCleanup = now;
        }
    }

    /**
     * Token Bucket implementation for rate limiting
     */
    private static class TokenBucket {
        private final int capacity;
        private final AtomicInteger tokens;
        private long lastRefill;
        private static final long REFILL_INTERVAL = 60000; // 1 minute

        public TokenBucket(int capacity) {
            this.capacity = capacity;
            this.tokens = new AtomicInteger(capacity);
            this.lastRefill = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            refill();
            int current = tokens.get();
            if (current > 0) {
                tokens.decrementAndGet();
                return true;
            }
            return false;
        }

        public int getRemaining() {
            refill();
            return tokens.get();
        }

        public long getResetTime() {
            return lastRefill + REFILL_INTERVAL;
        }

        public boolean isExpired(long now) {
            return now - lastRefill > REFILL_INTERVAL * 2;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            if (now - lastRefill >= REFILL_INTERVAL) {
                tokens.set(capacity);
                lastRefill = now;
            }
        }
    }
}
