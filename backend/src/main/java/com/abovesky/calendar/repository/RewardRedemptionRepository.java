package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.RewardRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {
    List<RewardRedemption> findByUserId(Long userId);
    List<RewardRedemption> findByUserIdOrderByRedeemedAtDesc(Long userId);
    List<RewardRedemption> findByStatus(String status);
}
