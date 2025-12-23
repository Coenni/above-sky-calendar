package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRepository extends JpaRepository<Meal, Long> {
    List<Meal> findByAssignedDate(LocalDate date);
    List<Meal> findByAssignedDateBetween(LocalDate startDate, LocalDate endDate);
    List<Meal> findByCategory(String category);
    List<Meal> findByIsFavorite(Boolean isFavorite);
    List<Meal> findByCreatedBy(Long userId);
    List<Meal> findByNameContainingIgnoreCase(String name);
}
