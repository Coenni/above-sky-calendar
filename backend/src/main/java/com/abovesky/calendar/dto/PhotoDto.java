package com.abovesky.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String caption;
    private String comments;
    private Long eventId;
    private LocalDateTime photoDate;
    private Long uploadedBy;
    private String tags;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
}
