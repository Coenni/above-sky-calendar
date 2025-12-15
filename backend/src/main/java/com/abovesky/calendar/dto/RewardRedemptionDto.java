package com.abovesky.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardRedemptionDto {
    private Long id;
    private Long userId;
    private Long rewardId;
    private Integer pointsSpent;
    private String status;
    private String notes;
    private LocalDateTime redeemedAt;
}
