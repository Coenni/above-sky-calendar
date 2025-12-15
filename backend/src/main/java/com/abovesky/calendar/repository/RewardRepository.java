package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByIsActive(Boolean isActive);
    List<Reward> findByCategory(String category);
    List<Reward> findByIsActiveAndPointsCostLessThanEqual(Boolean isActive, Integer points);
}
