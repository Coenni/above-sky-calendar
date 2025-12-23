package com.abovesky.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FamilyListDto {
    private Long id;
    private String name;
    private String type;
    private String description;
    private Boolean isShared;
    private Long createdBy;
    private Boolean isArchived;
    private LocalDateTime archivedAt;
    private String icon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
