package com.abovesky.calendar.service;

import com.abovesky.calendar.dto.FamilyListDto;
import com.abovesky.calendar.dto.ListItemDto;
import com.abovesky.calendar.entity.FamilyList;
import com.abovesky.calendar.entity.ListItem;
import com.abovesky.calendar.repository.FamilyListRepository;
import com.abovesky.calendar.repository.ListItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListService {

    private final FamilyListRepository listRepository;
    private final ListItemRepository itemRepository;

    // List operations
    public List<FamilyListDto> getAllLists() {
        return listRepository.findByIsArchivedFalse().stream()
                .map(this::convertListToDto)
                .collect(Collectors.toList());
    }

    public List<FamilyListDto> getSharedLists() {
        return listRepository.findByIsSharedTrue().stream()
                .filter(list -> !list.getIsArchived())
                .map(this::convertListToDto)
                .collect(Collectors.toList());
    }

    public FamilyListDto getListById(Long id) {
        FamilyList list = listRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found with id: " + id));
        return convertListToDto(list);
    }

    @Transactional
    public FamilyListDto createList(FamilyListDto listDto) {
        FamilyList list = convertListToEntity(listDto);
        FamilyList savedList = listRepository.save(list);
        return convertListToDto(savedList);
    }

    @Transactional
    public FamilyListDto updateList(Long id, FamilyListDto listDto) {
        FamilyList list = listRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found with id: " + id));

        list.setName(listDto.getName());
        list.setType(listDto.getType());
        list.setDescription(listDto.getDescription());
        list.setIsShared(listDto.getIsShared());
        list.setIcon(listDto.getIcon());

        FamilyList updatedList = listRepository.save(list);
        return convertListToDto(updatedList);
    }

    @Transactional
    public void archiveList(Long id) {
        FamilyList list = listRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List not found with id: " + id));
        list.setIsArchived(true);
        list.setArchivedAt(LocalDateTime.now());
        listRepository.save(list);
    }

    @Transactional
    public void deleteList(Long id) {
        if (!listRepository.existsById(id)) {
            throw new RuntimeException("List not found with id: " + id);
        }
        // Delete all items in the list first
        itemRepository.deleteAll(itemRepository.findByListId(id));
        listRepository.deleteById(id);
    }

    // List item operations
    public List<ListItemDto> getListItems(Long listId) {
        return itemRepository.findByListIdOrderByOrderIndexAsc(listId).stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ListItemDto createListItem(ListItemDto itemDto) {
        ListItem item = convertItemToEntity(itemDto);
        ListItem savedItem = itemRepository.save(item);
        return convertItemToDto(savedItem);
    }

    @Transactional
    public ListItemDto updateListItem(Long id, ListItemDto itemDto) {
        ListItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("List item not found with id: " + id));

        item.setContent(itemDto.getContent());
        item.setIsChecked(itemDto.getIsChecked());
        item.setPriority(itemDto.getPriority());
        item.setOrderIndex(itemDto.getOrderIndex());

        ListItem updatedItem = itemRepository.save(item);
        return convertItemToDto(updatedItem);
    }

    @Transactional
    public void deleteListItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("List item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    private FamilyListDto convertListToDto(FamilyList list) {
        FamilyListDto dto = new FamilyListDto();
        dto.setId(list.getId());
        dto.setName(list.getName());
        dto.setType(list.getType());
        dto.setDescription(list.getDescription());
        dto.setIsShared(list.getIsShared());
        dto.setCreatedBy(list.getCreatedBy());
        dto.setIsArchived(list.getIsArchived());
        dto.setArchivedAt(list.getArchivedAt());
        dto.setIcon(list.getIcon());
        dto.setCreatedAt(list.getCreatedAt());
        dto.setUpdatedAt(list.getUpdatedAt());
        return dto;
    }

    private FamilyList convertListToEntity(FamilyListDto dto) {
        FamilyList list = new FamilyList();
        list.setName(dto.getName());
        list.setType(dto.getType());
        list.setDescription(dto.getDescription());
        list.setIsShared(dto.getIsShared() != null ? dto.getIsShared() : true);
        list.setCreatedBy(dto.getCreatedBy());
        list.setIsArchived(false);
        list.setIcon(dto.getIcon());
        return list;
    }

    private ListItemDto convertItemToDto(ListItem item) {
        ListItemDto dto = new ListItemDto();
        dto.setId(item.getId());
        dto.setListId(item.getListId());
        dto.setContent(item.getContent());
        dto.setIsChecked(item.getIsChecked());
        dto.setPriority(item.getPriority());
        dto.setOrderIndex(item.getOrderIndex());
        dto.setAddedBy(item.getAddedBy());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }

    private ListItem convertItemToEntity(ListItemDto dto) {
        ListItem item = new ListItem();
        item.setListId(dto.getListId());
        item.setContent(dto.getContent());
        item.setIsChecked(dto.getIsChecked() != null ? dto.getIsChecked() : false);
        item.setPriority(dto.getPriority());
        item.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0);
        item.setAddedBy(dto.getAddedBy());
        return item;
    }
}
