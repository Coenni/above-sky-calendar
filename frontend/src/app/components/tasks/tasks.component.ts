import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TasksStateService } from '../../services/state/tasks-state.service';
import { TasksApiService } from '../../services/api/tasks-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  // Inject services using inject()
  private tasksState = inject(TasksStateService);
  private tasksApi = inject(TasksApiService);
  private authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly sortedTasks = this.tasksState.sortedTasks;
  readonly loading = this.tasksState.loading;
  readonly error = this.tasksState.error;
  readonly stats = this.tasksState.taskStats;
  readonly filterStatus = this.tasksState.filter;
  
  // Local component state
  showCreateForm = signal(false);
  
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

  onFilterChange(newFilter: string): void {
    this.tasksState.setFilter(newFilter);
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    if (this.showCreateForm()) {
      const currentUser = this.authState.currentUser();
      this.newTask = {
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        rewardPoints: 0,
        orderIndex: 0,
        createdBy: currentUser?.id
      };
    }
  }

  async createTask(): Promise<void> {
    if (!this.newTask.title) {
      alert('Please enter a task title');
      return;
    }

    try {
      const task = await this.tasksApi.createTask(this.newTask);
      this.tasksState.addTask(task);
      this.toggleCreateForm();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
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
}
