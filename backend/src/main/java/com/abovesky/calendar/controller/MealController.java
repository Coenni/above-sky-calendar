package com.abovesky.calendar.controller;

import com.abovesky.calendar.dto.MealDto;
import com.abovesky.calendar.entity.MealType;
import com.abovesky.calendar.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    public ResponseEntity<List<MealDto>> getAllMeals(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            Page<MealDto> mealsPage = mealService.getMealsPage(pageable);
            return ResponseEntity.ok(mealsPage.getContent());
        }
        
        return ResponseEntity.ok(mealService.getAllMeals());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MealDto>> searchMeals(@RequestParam String name) {
        return ResponseEntity.ok(mealService.searchMealsByName(name));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<MealDto>> getWeeklyMeals(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return ResponseEntity.ok(mealService.getWeeklyMeals(startDate));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<MealDto>> getMealsForCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(mealService.getMealsForDateRange(start, end));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<MealDto>> getFavoriteMeals() {
        return ResponseEntity.ok(mealService.getFavoriteMeals());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MealDto>> getMealsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(mealService.getMealsByCategory(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealDto> getMealById(@PathVariable Long id) {
        return ResponseEntity.ok(mealService.getMealById(id));
    }

    @PostMapping
    public ResponseEntity<MealDto> createMeal(@RequestBody MealDto mealDto) {
        MealDto createdMeal = mealService.createMeal(mealDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMeal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealDto> updateMeal(@PathVariable Long id, @RequestBody MealDto mealDto) {
        return ResponseEntity.ok(mealService.updateMeal(id, mealDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long id) {
        mealService.deleteMeal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<MealDto> assignMealToDate(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam MealType mealType) {
        MealDto assignedMeal = mealService.assignMealToDate(id, date, mealType);
        return ResponseEntity.ok(assignedMeal);
    }
}
