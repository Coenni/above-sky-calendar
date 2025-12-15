package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath; // Relative or absolute path to stored file

    @Column
    private String caption;

    @Column(length = 2000)
    private String comments; // JSON array of comments

    @Column
    private Long eventId; // Optional association with calendar event

    @Column
    private LocalDateTime photoDate; // When photo was taken

    @Column
    private Long uploadedBy;

    @Column
    private String tags; // Comma-separated tags for organization

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
