package com.abovesky.calendar.controller;

import com.abovesky.calendar.dto.PhotoDto;
import com.abovesky.calendar.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping
    public ResponseEntity<List<PhotoDto>> getAllPhotos() {
        return ResponseEntity.ok(photoService.getAllPhotos());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PhotoDto>> getPhotosByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(photoService.getPhotosByUser(userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<PhotoDto>> getPhotosByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(photoService.getPhotosByEvent(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhotoDto> getPhotoById(@PathVariable Long id) {
        return ResponseEntity.ok(photoService.getPhotoById(id));
    }

    @PostMapping
    public ResponseEntity<PhotoDto> createPhoto(@RequestBody PhotoDto photoDto) {
        PhotoDto createdPhoto = photoService.createPhoto(photoDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPhoto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhotoDto> updatePhoto(@PathVariable Long id, @RequestBody PhotoDto photoDto) {
        return ResponseEntity.ok(photoService.updatePhoto(id, photoDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long id) {
        photoService.deletePhoto(id);
        return ResponseEntity.noContent().build();
    }
}
