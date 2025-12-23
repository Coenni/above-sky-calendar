package com.abovesky.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long userId;
    private String category;
    private String color;
    private Boolean isAllDay;
    private String recurrencePattern;
    private String assignedMembers;
    private String reminderMinutes;
    private String icon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
