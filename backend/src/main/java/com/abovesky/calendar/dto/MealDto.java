package com.abovesky.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealDto {
    private Long id;
    private String name;
    private String category;
    private String recipe;
    private String ingredients;
    private LocalDate assignedDate;
    private String dietaryTags;
    private String imageUrl;
    private Boolean isFavorite;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
