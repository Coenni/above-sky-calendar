package com.abovesky.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListItemDto {
    private Long id;
    private Long listId;
    private String content;
    private Boolean isChecked;
    private String priority;
    private Integer orderIndex;
    private Long addedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
