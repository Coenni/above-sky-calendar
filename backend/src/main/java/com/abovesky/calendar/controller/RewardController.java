package com.abovesky.calendar.controller;

import com.abovesky.calendar.dto.RewardDto;
import com.abovesky.calendar.dto.RewardRedemptionDto;
import com.abovesky.calendar.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    public ResponseEntity<List<RewardDto>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @GetMapping("/active")
    public ResponseEntity<List<RewardDto>> getActiveRewards() {
        return ResponseEntity.ok(rewardService.getActiveRewards());
    }

    @GetMapping("/affordable/{userId}")
    public ResponseEntity<List<RewardDto>> getAffordableRewards(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getAffordableRewards(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RewardDto> getRewardById(@PathVariable Long id) {
        return ResponseEntity.ok(rewardService.getRewardById(id));
    }

    @PostMapping
    public ResponseEntity<RewardDto> createReward(@RequestBody RewardDto rewardDto) {
        RewardDto createdReward = rewardService.createReward(rewardDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReward);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RewardDto> updateReward(@PathVariable Long id, @RequestBody RewardDto rewardDto) {
        return ResponseEntity.ok(rewardService.updateReward(id, rewardDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReward(@PathVariable Long id) {
        rewardService.deleteReward(id);
        return ResponseEntity.noContent().build();
    }

    // Redemption endpoints
    @GetMapping("/redemptions/user/{userId}")
    public ResponseEntity<List<RewardRedemptionDto>> getUserRedemptions(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getUserRedemptions(userId));
    }

    @PostMapping("/redeem")
    public ResponseEntity<RewardRedemptionDto> redeemReward(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long rewardId = Long.valueOf(request.get("rewardId").toString());
        String notes = request.get("notes") != null ? request.get("notes").toString() : null;
        
        RewardRedemptionDto redemption = rewardService.redeemReward(userId, rewardId, notes);
        return ResponseEntity.status(HttpStatus.CREATED).body(redemption);
    }

    @PutMapping("/redemptions/{id}/status")
    public ResponseEntity<RewardRedemptionDto> updateRedemptionStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(rewardService.updateRedemptionStatus(id, status));
    }
}
