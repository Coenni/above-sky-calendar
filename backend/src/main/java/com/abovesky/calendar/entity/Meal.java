package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // breakfast, lunch, dinner, snack

    @Column(length = 5000)
    private String recipe; // Recipe instructions

    @Column
    private String ingredients; // JSON array of ingredients

    @Column
    private LocalDate assignedDate; // Date assigned in meal planner

    @Column
    private String dietaryTags; // Comma-separated tags: vegetarian, gluten-free, etc.

    @Column
    private String imageUrl; // Photo of the meal

    @Column
    private Boolean isFavorite = false;

    @Column
    private Long createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
