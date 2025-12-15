package com.abovesky.calendar.controller;

import com.abovesky.calendar.dto.EventDto;
import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.service.EventService;
import com.abovesky.calendar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            List<EventDto> events = eventService.getAllEventsByUserId(user.getId());
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        try {
            EventDto event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(
            @RequestBody EventDto eventDto,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            eventDto.setUserId(user.getId());
            EventDto createdEvent = eventService.createEvent(eventDto);
            return ResponseEntity.ok(createdEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(
            @PathVariable Long id,
            @RequestBody EventDto eventDto
    ) {
        try {
            EventDto updatedEvent = eventService.updateEvent(id, eventDto);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
