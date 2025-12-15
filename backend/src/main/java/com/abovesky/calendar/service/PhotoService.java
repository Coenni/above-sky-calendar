package com.abovesky.calendar.service;

import com.abovesky.calendar.dto.PhotoDto;
import com.abovesky.calendar.entity.Photo;
import com.abovesky.calendar.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;

    public List<PhotoDto> getAllPhotos() {
        return photoRepository.findAllByOrderByPhotoDateDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PhotoDto> getPhotosByUser(Long userId) {
        return photoRepository.findByUploadedBy(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PhotoDto> getPhotosByEvent(Long eventId) {
        return photoRepository.findByEventId(eventId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PhotoDto getPhotoById(Long id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Photo not found with id: " + id));
        return convertToDto(photo);
    }

    @Transactional
    public PhotoDto createPhoto(PhotoDto photoDto) {
        Photo photo = convertToEntity(photoDto);
        Photo savedPhoto = photoRepository.save(photo);
        return convertToDto(savedPhoto);
    }

    @Transactional
    public PhotoDto updatePhoto(Long id, PhotoDto photoDto) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Photo not found with id: " + id));

        photo.setCaption(photoDto.getCaption());
        photo.setComments(photoDto.getComments());
        photo.setEventId(photoDto.getEventId());
        photo.setPhotoDate(photoDto.getPhotoDate());
        photo.setTags(photoDto.getTags());

        Photo updatedPhoto = photoRepository.save(photo);
        return convertToDto(updatedPhoto);
    }

    @Transactional
    public void deletePhoto(Long id) {
        if (!photoRepository.existsById(id)) {
            throw new RuntimeException("Photo not found with id: " + id);
        }
        photoRepository.deleteById(id);
    }

    private PhotoDto convertToDto(Photo photo) {
        PhotoDto dto = new PhotoDto();
        dto.setId(photo.getId());
        dto.setFileName(photo.getFileName());
        dto.setFilePath(photo.getFilePath());
        dto.setCaption(photo.getCaption());
        dto.setComments(photo.getComments());
        dto.setEventId(photo.getEventId());
        dto.setPhotoDate(photo.getPhotoDate());
        dto.setUploadedBy(photo.getUploadedBy());
        dto.setTags(photo.getTags());
        dto.setUploadedAt(photo.getUploadedAt());
        dto.setUpdatedAt(photo.getUpdatedAt());
        return dto;
    }

    private Photo convertToEntity(PhotoDto dto) {
        Photo photo = new Photo();
        photo.setFileName(dto.getFileName());
        photo.setFilePath(dto.getFilePath());
        photo.setCaption(dto.getCaption());
        photo.setComments(dto.getComments());
        photo.setEventId(dto.getEventId());
        photo.setPhotoDate(dto.getPhotoDate());
        photo.setUploadedBy(dto.getUploadedBy());
        photo.setTags(dto.getTags());
        return photo;
    }
}
