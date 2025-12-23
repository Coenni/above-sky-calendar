package com.abovesky.calendar.service;

import com.abovesky.calendar.dto.MealDto;
import com.abovesky.calendar.entity.Meal;
import com.abovesky.calendar.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;

    public List<MealDto> getAllMeals() {
        return mealRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MealDto> getWeeklyMeals(LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(6);
        return mealRepository.findByAssignedDateBetween(startDate, endDate).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MealDto> getFavoriteMeals() {
        return mealRepository.findByIsFavorite(true).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<MealDto> getMealsByCategory(String category) {
        return mealRepository.findByCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public MealDto getMealById(Long id) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal not found with id: " + id));
        return convertToDto(meal);
    }

    @Transactional
    public MealDto createMeal(MealDto mealDto) {
        Meal meal = convertToEntity(mealDto);
        Meal savedMeal = mealRepository.save(meal);
        return convertToDto(savedMeal);
    }

    @Transactional
    public MealDto updateMeal(Long id, MealDto mealDto) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal not found with id: " + id));

        meal.setName(mealDto.getName());
        meal.setCategory(mealDto.getCategory());
        meal.setRecipe(mealDto.getRecipe());
        meal.setIngredients(mealDto.getIngredients());
        meal.setAssignedDate(mealDto.getAssignedDate());
        meal.setDietaryTags(mealDto.getDietaryTags());
        meal.setImageUrl(mealDto.getImageUrl());
        meal.setIsFavorite(mealDto.getIsFavorite());

        Meal updatedMeal = mealRepository.save(meal);
        return convertToDto(updatedMeal);
    }

    @Transactional
    public void deleteMeal(Long id) {
        if (!mealRepository.existsById(id)) {
            throw new RuntimeException("Meal not found with id: " + id);
        }
        mealRepository.deleteById(id);
    }

    private MealDto convertToDto(Meal meal) {
        MealDto dto = new MealDto();
        dto.setId(meal.getId());
        dto.setName(meal.getName());
        dto.setCategory(meal.getCategory());
        dto.setRecipe(meal.getRecipe());
        dto.setIngredients(meal.getIngredients());
        dto.setAssignedDate(meal.getAssignedDate());
        dto.setDietaryTags(meal.getDietaryTags());
        dto.setImageUrl(meal.getImageUrl());
        dto.setIsFavorite(meal.getIsFavorite());
        dto.setIcon(meal.getIcon());
        dto.setCreatedBy(meal.getCreatedBy());
        dto.setCreatedAt(meal.getCreatedAt());
        dto.setUpdatedAt(meal.getUpdatedAt());
        return dto;
    }

    private Meal convertToEntity(MealDto dto) {
        Meal meal = new Meal();
        meal.setName(dto.getName());
        meal.setCategory(dto.getCategory());
        meal.setRecipe(dto.getRecipe());
        meal.setIngredients(dto.getIngredients());
        meal.setAssignedDate(dto.getAssignedDate());
        meal.setDietaryTags(dto.getDietaryTags());
        meal.setImageUrl(dto.getImageUrl());
        meal.setIsFavorite(dto.getIsFavorite() != null ? dto.getIsFavorite() : false);
        meal.setIcon(dto.getIcon());
        meal.setCreatedBy(dto.getCreatedBy());
        return meal;
    }
}
