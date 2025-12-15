package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "list_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long listId;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Boolean isChecked = false;

    @Column
    private String priority; // high, medium, low, none

    @Column
    private Integer orderIndex = 0; // For manual ordering

    @Column
    private Long addedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
