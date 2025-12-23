package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FamilyList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // shopping, todo, packing, wish, custom

    @Column
    private String description;

    @Column(nullable = false)
    private Boolean isShared = true; // Shared with all family members

    @Column
    private Long createdBy;

    @Column(nullable = false)
    private Boolean isArchived = false;

    @Column
    private LocalDateTime archivedAt;

    @Column
    private String icon; // Emoji or icon identifier for child-friendly UI

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
