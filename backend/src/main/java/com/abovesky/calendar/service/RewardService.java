package com.abovesky.calendar.service;

import com.abovesky.calendar.dto.RewardDto;
import com.abovesky.calendar.dto.RewardRedemptionDto;
import com.abovesky.calendar.entity.Reward;
import com.abovesky.calendar.entity.RewardRedemption;
import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.repository.RewardRedemptionRepository;
import com.abovesky.calendar.repository.RewardRepository;
import com.abovesky.calendar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final UserRepository userRepository;

    public List<RewardDto> getAllRewards() {
        return rewardRepository.findAll().stream()
                .map(this::convertRewardToDto)
                .collect(Collectors.toList());
    }

    public List<RewardDto> getActiveRewards() {
        return rewardRepository.findByIsActive(true).stream()
                .map(this::convertRewardToDto)
                .collect(Collectors.toList());
    }

    public List<RewardDto> getAffordableRewards(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return rewardRepository.findByIsActiveAndPointsCostLessThanEqual(true, user.getRewardPoints()).stream()
                .map(this::convertRewardToDto)
                .collect(Collectors.toList());
    }

    public RewardDto getRewardById(Long id) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reward not found with id: " + id));
        return convertRewardToDto(reward);
    }

    @Transactional
    public RewardDto createReward(RewardDto rewardDto) {
        Reward reward = convertRewardToEntity(rewardDto);
        Reward savedReward = rewardRepository.save(reward);
        return convertRewardToDto(savedReward);
    }

    @Transactional
    public RewardDto updateReward(Long id, RewardDto rewardDto) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reward not found with id: " + id));

        reward.setName(rewardDto.getName());
        reward.setDescription(rewardDto.getDescription());
        reward.setPointsCost(rewardDto.getPointsCost());
        reward.setCategory(rewardDto.getCategory());
        reward.setImageUrl(rewardDto.getImageUrl());
        reward.setIsActive(rewardDto.getIsActive());
        reward.setStockQuantity(rewardDto.getStockQuantity());
        reward.setIcon(rewardDto.getIcon());

        Reward updatedReward = rewardRepository.save(reward);
        return convertRewardToDto(updatedReward);
    }

    @Transactional
    public void deleteReward(Long id) {
        if (!rewardRepository.existsById(id)) {
            throw new RuntimeException("Reward not found with id: " + id);
        }
        rewardRepository.deleteById(id);
    }

    // Redemption methods
    public List<RewardRedemptionDto> getUserRedemptions(Long userId) {
        return redemptionRepository.findByUserIdOrderByRedeemedAtDesc(userId).stream()
                .map(this::convertRedemptionToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RewardRedemptionDto redeemReward(Long userId, Long rewardId, String notes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Reward not found with id: " + rewardId));

        // Validate user has enough points
        if (user.getRewardPoints() < reward.getPointsCost()) {
            throw new RuntimeException("Insufficient points. Required: " + reward.getPointsCost() + ", Available: " + user.getRewardPoints());
        }

        // Check stock availability
        if (reward.getStockQuantity() != null && reward.getStockQuantity() >= 0 && reward.getStockQuantity() == 0) {
            throw new RuntimeException("Reward is out of stock");
        }

        // Deduct points from user
        user.setRewardPoints(user.getRewardPoints() - reward.getPointsCost());
        userRepository.save(user);

        // Decrease stock if applicable
        if (reward.getStockQuantity() != null && reward.getStockQuantity() > 0) {
            reward.setStockQuantity(reward.getStockQuantity() - 1);
            rewardRepository.save(reward);
        }

        // Create redemption record
        RewardRedemption redemption = new RewardRedemption();
        redemption.setUserId(userId);
        redemption.setRewardId(rewardId);
        redemption.setPointsSpent(reward.getPointsCost());
        redemption.setStatus("pending");
        redemption.setNotes(notes);

        RewardRedemption savedRedemption = redemptionRepository.save(redemption);
        return convertRedemptionToDto(savedRedemption);
    }

    @Transactional
    public RewardRedemptionDto updateRedemptionStatus(Long redemptionId, String status) {
        RewardRedemption redemption = redemptionRepository.findById(redemptionId)
                .orElseThrow(() -> new RuntimeException("Redemption not found with id: " + redemptionId));
        redemption.setStatus(status);
        RewardRedemption updatedRedemption = redemptionRepository.save(redemption);
        return convertRedemptionToDto(updatedRedemption);
    }

    private RewardDto convertRewardToDto(Reward reward) {
        RewardDto dto = new RewardDto();
        dto.setId(reward.getId());
        dto.setName(reward.getName());
        dto.setDescription(reward.getDescription());
        dto.setPointsCost(reward.getPointsCost());
        dto.setCategory(reward.getCategory());
        dto.setImageUrl(reward.getImageUrl());
        dto.setIsActive(reward.getIsActive());
        dto.setStockQuantity(reward.getStockQuantity());
        dto.setIcon(reward.getIcon());
        dto.setCreatedAt(reward.getCreatedAt());
        dto.setUpdatedAt(reward.getUpdatedAt());
        return dto;
    }

    private Reward convertRewardToEntity(RewardDto dto) {
        Reward reward = new Reward();
        reward.setName(dto.getName());
        reward.setDescription(dto.getDescription());
        reward.setPointsCost(dto.getPointsCost());
        reward.setCategory(dto.getCategory());
        reward.setImageUrl(dto.getImageUrl());
        reward.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        reward.setStockQuantity(dto.getStockQuantity());
        reward.setIcon(dto.getIcon());
        return reward;
    }

    private RewardRedemptionDto convertRedemptionToDto(RewardRedemption redemption) {
        RewardRedemptionDto dto = new RewardRedemptionDto();
        dto.setId(redemption.getId());
        dto.setUserId(redemption.getUserId());
        dto.setRewardId(redemption.getRewardId());
        dto.setPointsSpent(redemption.getPointsSpent());
        dto.setStatus(redemption.getStatus());
        dto.setNotes(redemption.getNotes());
        dto.setRedeemedAt(redemption.getRedeemedAt());
        return dto;
    }
}
