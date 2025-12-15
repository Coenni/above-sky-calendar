package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.ListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListItemRepository extends JpaRepository<ListItem, Long> {
    List<ListItem> findByListId(Long listId);
    List<ListItem> findByListIdOrderByOrderIndexAsc(Long listId);
    List<ListItem> findByListIdAndIsChecked(Long listId, Boolean isChecked);
}
