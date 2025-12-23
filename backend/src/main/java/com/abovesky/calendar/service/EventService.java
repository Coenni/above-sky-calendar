package com.abovesky.calendar.service;

import com.abovesky.calendar.dto.EventDto;
import com.abovesky.calendar.entity.Event;
import com.abovesky.calendar.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<EventDto> getAllEventsByUserId(Long userId) {
        return eventRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        return convertToDto(event);
    }

    public EventDto createEvent(EventDto eventDto) {
        Event event = convertToEntity(eventDto);
        event = eventRepository.save(event);
        return convertToDto(event);
    }

    public EventDto updateEvent(Long id, EventDto eventDto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));

        event.setTitle(eventDto.getTitle());
        event.setDescription(eventDto.getDescription());
        event.setStartDate(eventDto.getStartDate());
        event.setEndDate(eventDto.getEndDate());
        event.setCategory(eventDto.getCategory());
        event.setColor(eventDto.getColor());
        event.setIsAllDay(eventDto.getIsAllDay());
        event.setRecurrencePattern(eventDto.getRecurrencePattern());
        event.setAssignedMembers(eventDto.getAssignedMembers());
        event.setReminderMinutes(eventDto.getReminderMinutes());
        event.setIcon(eventDto.getIcon());

        event = eventRepository.save(event);
        return convertToDto(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    private EventDto convertToDto(Event event) {
        return new EventDto(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDate(),
                event.getEndDate(),
                event.getUserId(),
                event.getCategory(),
                event.getColor(),
                event.getIsAllDay(),
                event.getRecurrencePattern(),
                event.getAssignedMembers(),
                event.getReminderMinutes(),
                event.getIcon(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    private Event convertToEntity(EventDto dto) {
        Event event = new Event();
        event.setId(dto.getId());
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setUserId(dto.getUserId());
        event.setCategory(dto.getCategory());
        event.setColor(dto.getColor());
        event.setIsAllDay(dto.getIsAllDay());
        event.setRecurrencePattern(dto.getRecurrencePattern());
        event.setAssignedMembers(dto.getAssignedMembers());
        event.setReminderMinutes(dto.getReminderMinutes());
        event.setIcon(dto.getIcon());
        return event;
    }
}
