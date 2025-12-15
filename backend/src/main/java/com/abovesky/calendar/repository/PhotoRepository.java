package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByUploadedBy(Long userId);
    List<Photo> findByEventId(Long eventId);
    List<Photo> findByPhotoDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Photo> findAllByOrderByPhotoDateDesc();
    List<Photo> findAllByOrderByUploadedAtDesc();
}
