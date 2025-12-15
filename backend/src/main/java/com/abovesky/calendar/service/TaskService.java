package com.abovesky.calendar.service;

import com.abovesky.calendar.dto.TaskDto;
import com.abovesky.calendar.entity.Task;
import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.repository.TaskRepository;
import com.abovesky.calendar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return convertToDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskDto taskDto) {
        Task task = convertToEntity(taskDto);
        Task savedTask = taskRepository.save(task);
        return convertToDto(savedTask);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setDueDate(taskDto.getDueDate());
        task.setAssignedUserId(taskDto.getAssignedUserId());
        task.setPriority(taskDto.getPriority());
        task.setStatus(taskDto.getStatus());
        task.setCategory(taskDto.getCategory());
        task.setRecurrencePattern(taskDto.getRecurrencePattern());
        task.setRewardPoints(taskDto.getRewardPoints());
        task.setSubtasks(taskDto.getSubtasks());
        task.setOrderIndex(taskDto.getOrderIndex());

        Task updatedTask = taskRepository.save(task);
        return convertToDto(updatedTask);
    }

    @Transactional
    public TaskDto completeTask(Long id, Long userId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setStatus("completed");
        task.setCompletedAt(LocalDateTime.now());

        // Award points to the assigned user
        if (task.getAssignedUserId() != null && task.getRewardPoints() != null && task.getRewardPoints() > 0) {
            User user = userRepository.findById(task.getAssignedUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + task.getAssignedUserId()));
            user.setRewardPoints(user.getRewardPoints() + task.getRewardPoints());
            userRepository.save(user);
        }

        Task updatedTask = taskRepository.save(task);
        return convertToDto(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    private TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setAssignedUserId(task.getAssignedUserId());
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setCategory(task.getCategory());
        dto.setRecurrencePattern(task.getRecurrencePattern());
        dto.setRewardPoints(task.getRewardPoints());
        dto.setSubtasks(task.getSubtasks());
        dto.setOrderIndex(task.getOrderIndex());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedBy(task.getCreatedBy());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    private Task convertToEntity(TaskDto dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setAssignedUserId(dto.getAssignedUserId());
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : "medium");
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : "pending");
        task.setCategory(dto.getCategory());
        task.setRecurrencePattern(dto.getRecurrencePattern());
        task.setRewardPoints(dto.getRewardPoints() != null ? dto.getRewardPoints() : 0);
        task.setSubtasks(dto.getSubtasks());
        task.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0);
        task.setCreatedBy(dto.getCreatedBy());
        return task;
    }
}
