package com.abovesky.calendar.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Custom Health Indicator for Above Sky Calendar
 * Checks database, Redis, and disk space
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;
    private final RedisConnectionFactory redisConnectionFactory;

    // Disk space threshold (80%)
    private static final double DISK_SPACE_THRESHOLD = 0.8;

    @Override
    public Health health() {
        try {
            // Check database
            boolean databaseHealthy = checkDatabase();
            
            // Check Redis
            boolean redisHealthy = checkRedis();
            
            // Check disk space
            DiskSpaceStatus diskSpaceStatus = checkDiskSpace();
            
            // Build health response
            Health.Builder healthBuilder = Health.up();
            
            if (!databaseHealthy) {
                healthBuilder = Health.down();
            }
            
            if (!redisHealthy) {
                healthBuilder = healthBuilder.status("DEGRADED");
            }
            
            if (diskSpaceStatus.isLow()) {
                healthBuilder = healthBuilder.status("WARNING");
            }
            
            return healthBuilder
                    .withDetail("database", databaseHealthy ? "UP" : "DOWN")
                    .withDetail("redis", redisHealthy ? "UP" : "DOWN")
                    .withDetail("diskSpace", diskSpaceStatus.getDetails())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error checking health", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }

    /**
     * Check database connectivity and basic query
     */
    private boolean checkDatabase() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return result != null && result == 1;
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return false;
        }
    }

    /**
     * Check Redis connectivity
     */
    private boolean checkRedis() {
        try {
            RedisConnection connection = redisConnectionFactory.getConnection();
            String pong = connection.ping();
            connection.close();
            return "PONG".equals(pong);
        } catch (Exception e) {
            log.error("Redis health check failed", e);
            return false;
        }
    }

    /**
     * Check disk space availability
     */
    private DiskSpaceStatus checkDiskSpace() {
        try {
            File root = new File("/");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;
            double usagePercent = (double) usedSpace / totalSpace;
            
            boolean isLow = usagePercent > DISK_SPACE_THRESHOLD;
            
            return new DiskSpaceStatus(
                isLow,
                formatBytes(totalSpace),
                formatBytes(freeSpace),
                formatBytes(usedSpace),
                String.format("%.2f%%", usagePercent * 100)
            );
        } catch (Exception e) {
            log.error("Disk space check failed", e);
            return new DiskSpaceStatus(
                true,
                "Unknown",
                "Unknown",
                "Unknown",
                "Error"
            );
        }
    }

    /**
     * Format bytes to human-readable format
     */
    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.2f %sB", bytes / Math.pow(1024, exp), pre);
    }

    /**
     * Inner class to hold disk space status
     */
    private static class DiskSpaceStatus {
        private final boolean low;
        private final String total;
        private final String free;
        private final String used;
        private final String usagePercent;

        public DiskSpaceStatus(boolean low, String total, String free, String used, String usagePercent) {
            this.low = low;
            this.total = total;
            this.free = free;
            this.used = used;
            this.usagePercent = usagePercent;
        }

        public boolean isLow() {
            return low;
        }

        public String getDetails() {
            return String.format("total=%s, free=%s, used=%s (%s)", total, free, used, usagePercent);
        }
    }
}
