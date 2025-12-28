import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TasksStateService } from '../../services/state/tasks-state.service';
import { TasksApiService } from '../../services/api/tasks-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { ModeService } from '../../services/mode.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  // Inject services using inject()
  private tasksState = inject(TasksStateService);
  private tasksApi = inject(TasksApiService);
  private authState = inject(AuthStateService);
  private modeService = inject(ModeService);
  
  // Expose signals to template
  readonly sortedTasks = this.tasksState.sortedTasks;
  readonly loading = this.tasksState.loading;
  readonly error = this.tasksState.error;
  readonly stats = this.tasksState.taskStats;
  readonly filterStatus = this.tasksState.filter;
  
  // Check if in Parent Mode (buttons should be visible)
  readonly isParentMode = computed(() => this.modeService.isParentMode());
  
  // Local component state
  showCreateModal = signal(false);
  editingTask = signal<Task | null>(null);
  
  // Mock family members (in real app, would come from a service)
  // Colors from design system: sage green, terracotta, mint, peach
  familyMembers = signal([
    { id: 1, username: 'Mom', color: '#A8B5A0' },    // $color-sage-green
    { id: 2, username: 'Dad', color: '#D4906C' },    // $color-terracotta
    { id: 3, username: 'Emma', color: '#B8D4C1' },   // $color-mint
    { id: 4, username: 'Noah', color: '#F4C7AB' }    // $color-peach
  ]);
  

  
  newTask: Task = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    rewardPoints: 0,
    orderIndex: 0
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    this.tasksState.setLoading(true);
    this.tasksState.setError(null);
    try {
      const tasks = await this.tasksApi.getTasks();
      this.tasksState.setTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasksState.setError('Failed to load tasks');
    } finally {
      this.tasksState.setLoading(false);
    }
  }

  toggleCreateModal(): void {
    this.showCreateModal.set(true);
    this.editingTask.set(null);
    const currentUser = this.authState.currentUser();
    this.newTask = {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      rewardPoints: 0,
      orderIndex: 0,
      createdBy: currentUser?.id,
      assignedUserId: undefined // Default to unassigned
    };
  }

  closeModal(): void {
    this.showCreateModal.set(false);
    this.editingTask.set(null);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.newTask = { ...task };
    this.showCreateModal.set(true);
  }

  async saveTask(): Promise<void> {
    if (!this.newTask.title) {
      alert('Please enter a task title');
      return;
    }

    try {
      const editingTask = this.editingTask();
      if (editingTask && editingTask.id) {
        // Update existing task
        const updatedTask = await this.tasksApi.updateTask(editingTask.id, this.newTask);
        this.tasksState.updateTask(editingTask.id, updatedTask);
      } else {
        // Create new task
        const task = await this.tasksApi.createTask(this.newTask);
        this.tasksState.addTask(task);
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  }

  async completeTask(task: Task): Promise<void> {
    if (!task.id) return;
    
    const currentUser = this.authState.currentUser();
    if (!currentUser) return;

    try {
      const updatedTask = await this.tasksApi.completeTask(task.id, currentUser.id);
      this.tasksState.updateTask(task.id, updatedTask);
      // Update user points
      this.authState.addUserPoints(task.rewardPoints);
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  }

  async deleteTask(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await this.tasksApi.deleteTask(id);
      this.tasksState.removeTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in_progress': return 'badge-warning';
      case 'pending': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }
  
  // Family member assignment methods
  getAssigneeName(userId?: number): string {
    if (!userId) return 'Unassigned';
    const member = this.familyMembers().find(m => m.id === userId);
    return member ? member.username : 'Unknown';
  }
  
  getAssigneeColor(userId?: number): string {
    if (!userId) return '#9ca3af';
    const member = this.familyMembers().find(m => m.id === userId);
    return member ? member.color : '#9ca3af';
  }
  
  getAssigneeInitial(userId?: number): string {
    const name = this.getAssigneeName(userId);
    return name.charAt(0).toUpperCase();
  }
  
  getTasksForAssignee(userId: number | null): Task[] {
    const tasks = this.sortedTasks();
    if (userId === null) {
      return tasks.filter(task => !task.assignedUserId);
    }
    return tasks.filter(task => task.assignedUserId === userId);
  }
}
