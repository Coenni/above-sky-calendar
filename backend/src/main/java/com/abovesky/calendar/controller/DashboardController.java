package com.abovesky.calendar.controller;

import com.abovesky.calendar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final MealRepository mealRepository;
    private final PhotoRepository photoRepository;
    private final FamilyListRepository listRepository;
    private final UserRepository userRepository;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        metrics.put("totalEvents", eventRepository.count());
        metrics.put("totalTasks", taskRepository.count());
        metrics.put("pendingTasks", taskRepository.findByStatus("pending").size());
        metrics.put("completedTasks", taskRepository.findByStatus("completed").size());
        metrics.put("totalRewards", rewardRepository.count());
        metrics.put("activeRewards", rewardRepository.findByIsActive(true).size());
        metrics.put("totalMeals", mealRepository.count());
        metrics.put("totalPhotos", photoRepository.count());
        metrics.put("totalLists", listRepository.count());
        metrics.put("activeLists", listRepository.findByIsArchivedFalse().size());
        metrics.put("totalUsers", userRepository.count());
        
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/metrics/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserMetrics(@PathVariable Long userId) {
        Map<String, Object> metrics = new HashMap<>();
        
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        metrics.put("rewardPoints", user.getRewardPoints());
        metrics.put("assignedTasks", taskRepository.findByAssignedUserId(userId).size());
        metrics.put("completedTasks", taskRepository.findByAssignedUserIdAndStatus(userId, "completed").size());
        metrics.put("pendingTasks", taskRepository.findByAssignedUserIdAndStatus(userId, "pending").size());
        metrics.put("redemptions", redemptionRepository.findByUserId(userId).size());
        metrics.put("uploadedPhotos", photoRepository.findByUploadedBy(userId).size());
        
        return ResponseEntity.ok(metrics);
    }
}
