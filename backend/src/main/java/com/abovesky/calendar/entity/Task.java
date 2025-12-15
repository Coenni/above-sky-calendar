package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column
    private LocalDateTime dueDate;

    @Column
    private Long assignedUserId; // Family member assigned to this task

    @Column(nullable = false)
    private String priority = "medium"; // high, medium, low

    @Column(nullable = false)
    private String status = "pending"; // pending, in_progress, completed

    @Column
    private String category; // Task category/tag

    @Column
    private String recurrencePattern; // JSON: {type: 'daily'|'weekly'|'monthly', interval: 1}

    @Column
    private Integer rewardPoints = 0; // Points awarded on completion

    @Column
    private String subtasks; // JSON array of subtask items

    @Column
    private Integer orderIndex = 0; // For drag-and-drop ordering

    @Column
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private Long createdBy; // User who created the task

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
