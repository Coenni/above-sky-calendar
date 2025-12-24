package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rewards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer pointsCost; // Points required to redeem

    @Column
    private String category; // e.g., "treats", "activities", "privileges"

    @Column(length = 512)
    private String imageUrl; // Optional image for the reward

    @Column(nullable = false)
    private Boolean isActive = true; // Whether reward is available

    @Column
    private Integer stockQuantity; // -1 for unlimited, 0+ for limited stock

    @Column
    private String icon; // Emoji or icon identifier for child-friendly UI

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
