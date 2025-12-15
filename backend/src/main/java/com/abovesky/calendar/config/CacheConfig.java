package com.abovesky.calendar.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Cache Configuration for Above Sky Calendar
 * Configures caching with different TTL policies for different data types
 */
@Configuration
@EnableCaching
public class CacheConfig extends CachingConfigurerSupport {

    /**
     * Configure Redis Cache Manager with custom cache configurations
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration (5 minutes TTL)
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Specific cache configurations for different data types
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // User data - cache for 15 minutes
        cacheConfigurations.put("users",
                defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // Events - cache for 10 minutes (frequently changing)
        cacheConfigurations.put("events",
                defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // Tasks - cache for 10 minutes
        cacheConfigurations.put("tasks",
                defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // Rewards - cache for 30 minutes (less frequently changing)
        cacheConfigurations.put("rewards",
                defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // Meals - cache for 20 minutes
        cacheConfigurations.put("meals",
                defaultConfig.entryTtl(Duration.ofMinutes(20)));

        // Photos - cache for 60 minutes (rarely changing once uploaded)
        cacheConfigurations.put("photos",
                defaultConfig.entryTtl(Duration.ofMinutes(60)));

        // Lists - cache for 10 minutes
        cacheConfigurations.put("lists",
                defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // Dashboard data - cache for 5 minutes (aggregated data)
        cacheConfigurations.put("dashboard",
                defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Metrics - cache for 2 minutes (real-time data)
        cacheConfigurations.put("metrics",
                defaultConfig.entryTtl(Duration.ofMinutes(2)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }
}
