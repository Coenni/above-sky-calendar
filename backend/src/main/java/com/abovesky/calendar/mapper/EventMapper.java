package com.abovesky.calendar.mapper;

import com.abovesky.calendar.api.model.Event;
import com.abovesky.calendar.api.model.EventInput;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper class to convert between API models and JPA entities for Events.
 * This demonstrates how to work with generated OpenAPI models.
 */
@Component
public class EventMapper {

    /**
     * Convert JPA entity to API model
     */
    public Event toApiModel(com.abovesky.calendar.entity.Event entity) {
        if (entity == null) {
            return null;
        }

        Event apiModel = new Event();
        apiModel.setId(entity.getId());
        apiModel.setTitle(entity.getTitle());
        apiModel.setDescription(entity.getDescription());
        apiModel.setStartDate(toOffsetDateTime(entity.getStartDate()));
        apiModel.setEndDate(toOffsetDateTime(entity.getEndDate()));
        apiModel.setUserId(entity.getUserId());
        apiModel.setCategory(entity.getCategory());
        apiModel.setColor(entity.getColor());
        apiModel.setIsAllDay(entity.getIsAllDay());
        apiModel.setRecurrencePattern(entity.getRecurrencePattern());
        
        // Convert comma-separated string to List of Long
        if (entity.getAssignedMembers() != null && !entity.getAssignedMembers().isEmpty()) {
            List<Long> memberIds = Arrays.stream(entity.getAssignedMembers().split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            apiModel.setAssignedMembers(memberIds);
        }
        
        // Convert comma-separated reminder minutes to List of Integer
        if (entity.getReminderMinutes() != null && !entity.getReminderMinutes().isEmpty()) {
            List<Integer> reminders = Arrays.stream(entity.getReminderMinutes().split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            apiModel.setReminderMinutes(reminders);
        }
        
        apiModel.setCreatedAt(toOffsetDateTime(entity.getCreatedAt()));
        apiModel.setUpdatedAt(toOffsetDateTime(entity.getUpdatedAt()));
        
        return apiModel;
    }

    /**
     * Convert API input model to JPA entity for creation
     */
    public com.abovesky.calendar.entity.Event toEntity(EventInput input) {
        if (input == null) {
            return null;
        }

        com.abovesky.calendar.entity.Event entity = new com.abovesky.calendar.entity.Event();
        entity.setTitle(input.getTitle());
        entity.setDescription(input.getDescription());
        entity.setStartDate(toLocalDateTime(input.getStartDate()));
        entity.setEndDate(toLocalDateTime(input.getEndDate()));
        entity.setCategory(input.getCategory());
        entity.setColor(input.getColor());
        entity.setIsAllDay(input.getIsAllDay() != null ? input.getIsAllDay() : false);
        entity.setRecurrencePattern(input.getRecurrencePattern());
        
        // Convert List of Long to comma-separated string
        if (input.getAssignedMembers() != null && !input.getAssignedMembers().isEmpty()) {
            String memberIds = input.getAssignedMembers().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            entity.setAssignedMembers(memberIds);
        }
        
        // Convert List of Integer to comma-separated string
        if (input.getReminderMinutes() != null && !input.getReminderMinutes().isEmpty()) {
            String reminders = input.getReminderMinutes().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            entity.setReminderMinutes(reminders);
        }
        
        return entity;
    }

    /**
     * Update existing entity with values from API input model
     */
    public void updateEntity(com.abovesky.calendar.entity.Event entity, EventInput input) {
        if (entity == null || input == null) {
            return;
        }

        if (input.getTitle() != null) {
            entity.setTitle(input.getTitle());
        }
        if (input.getDescription() != null) {
            entity.setDescription(input.getDescription());
        }
        if (input.getStartDate() != null) {
            entity.setStartDate(toLocalDateTime(input.getStartDate()));
        }
        if (input.getEndDate() != null) {
            entity.setEndDate(toLocalDateTime(input.getEndDate()));
        }
        if (input.getCategory() != null) {
            entity.setCategory(input.getCategory());
        }
        if (input.getColor() != null) {
            entity.setColor(input.getColor());
        }
        if (input.getIsAllDay() != null) {
            entity.setIsAllDay(input.getIsAllDay());
        }
        if (input.getRecurrencePattern() != null) {
            entity.setRecurrencePattern(input.getRecurrencePattern());
        }
        
        // Update assigned members
        if (input.getAssignedMembers() != null) {
            if (input.getAssignedMembers().isEmpty()) {
                entity.setAssignedMembers(null);
            } else {
                String memberIds = input.getAssignedMembers().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(","));
                entity.setAssignedMembers(memberIds);
            }
        }
        
        // Update reminder minutes
        if (input.getReminderMinutes() != null) {
            if (input.getReminderMinutes().isEmpty()) {
                entity.setReminderMinutes(null);
            } else {
                String reminders = input.getReminderMinutes().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(","));
                entity.setReminderMinutes(reminders);
            }
        }
    }

    /**
     * Helper method to convert LocalDateTime to OffsetDateTime
     */
    private OffsetDateTime toOffsetDateTime(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atOffset(ZoneOffset.UTC);
    }

    /**
     * Helper method to convert OffsetDateTime to LocalDateTime
     */
    private LocalDateTime toLocalDateTime(OffsetDateTime offsetDateTime) {
        if (offsetDateTime == null) {
            return null;
        }
        return offsetDateTime.atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }
}
