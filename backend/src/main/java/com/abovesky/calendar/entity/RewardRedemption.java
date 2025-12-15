package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_redemptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // Family member who redeemed

    @Column(nullable = false)
    private Long rewardId;

    @Column(nullable = false)
    private Integer pointsSpent;

    @Column
    private String status = "pending"; // pending, approved, fulfilled, cancelled

    @Column(length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime redeemedAt;
}
