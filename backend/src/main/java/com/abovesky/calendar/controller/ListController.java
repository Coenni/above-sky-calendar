package com.abovesky.calendar.controller;

import com.abovesky.calendar.dto.FamilyListDto;
import com.abovesky.calendar.dto.ListItemDto;
import com.abovesky.calendar.service.ListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ListController {

    private final ListService listService;

    // List endpoints
    @GetMapping
    public ResponseEntity<List<FamilyListDto>> getAllLists() {
        return ResponseEntity.ok(listService.getAllLists());
    }

    @GetMapping("/shared")
    public ResponseEntity<List<FamilyListDto>> getSharedLists() {
        return ResponseEntity.ok(listService.getSharedLists());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyListDto> getListById(@PathVariable Long id) {
        return ResponseEntity.ok(listService.getListById(id));
    }

    @PostMapping
    public ResponseEntity<FamilyListDto> createList(@RequestBody FamilyListDto listDto) {
        FamilyListDto createdList = listService.createList(listDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyListDto> updateList(@PathVariable Long id, @RequestBody FamilyListDto listDto) {
        return ResponseEntity.ok(listService.updateList(id, listDto));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Void> archiveList(@PathVariable Long id) {
        listService.archiveList(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        listService.deleteList(id);
        return ResponseEntity.noContent().build();
    }

    // List item endpoints
    @GetMapping("/{listId}/items")
    public ResponseEntity<List<ListItemDto>> getListItems(@PathVariable Long listId) {
        return ResponseEntity.ok(listService.getListItems(listId));
    }

    @PostMapping("/items")
    public ResponseEntity<ListItemDto> createListItem(@RequestBody ListItemDto itemDto) {
        ListItemDto createdItem = listService.createListItem(itemDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ListItemDto> updateListItem(@PathVariable Long id, @RequestBody ListItemDto itemDto) {
        return ResponseEntity.ok(listService.updateListItem(id, itemDto));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteListItem(@PathVariable Long id) {
        listService.deleteListItem(id);
        return ResponseEntity.noContent().build();
    }
}
