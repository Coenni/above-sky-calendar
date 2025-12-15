package com.abovesky.calendar.repository;

import com.abovesky.calendar.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedUserId(Long userId);
    List<Task> findByCreatedBy(Long userId);
    List<Task> findByStatus(String status);
    List<Task> findByAssignedUserIdAndStatus(Long userId, String status);
    List<Task> findByAssignedUserIdOrderByOrderIndexAsc(Long userId);
}
