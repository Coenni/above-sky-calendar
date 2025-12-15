package com.abovesky.calendar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration for asynchronous task execution
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Default async configuration is sufficient for email sending
    // Spring Boot will create a SimpleAsyncTaskExecutor with default settings
}
