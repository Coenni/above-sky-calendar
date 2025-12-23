package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Long userId;

    // Enhanced calendar features
    @Column
    private String category; // appointments, activities, school, work, etc.

    @Column
    private String color; // Color coding for the event

    @Column
    private Boolean isAllDay = false;

    @Column
    private String recurrencePattern; // JSON: {type: 'daily'|'weekly'|'monthly'|'yearly', interval: 1, endDate: '2024-12-31'}

    @Column
    private String assignedMembers; // Comma-separated user IDs for multi-member events

    @Column
    private String reminderMinutes; // Comma-separated minutes before event (e.g., "15,60,1440")

    @Column
    private String icon; // Emoji or icon identifier for child-friendly UI

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
