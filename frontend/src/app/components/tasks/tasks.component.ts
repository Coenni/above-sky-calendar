import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isLoading = false;
  showCreateForm = false;
  filterStatus = 'all';
  
  newTask: Task = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    rewardPoints: 0,
    orderIndex: 0
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.filterStatus === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(t => t.status === this.filterStatus);
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      const currentUser = this.authService.getCurrentUser();
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

  createTask(): void {
    if (!this.newTask.title) {
      alert('Please enter a task title');
      return;
    }

    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.applyFilter();
        this.toggleCreateForm();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        alert('Failed to create task');
      }
    });
  }

  completeTask(task: Task): void {
    if (!task.id) return;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.taskService.completeTask(task.id, currentUser.id).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error completing task:', error);
        alert('Failed to complete task');
      }
    });
  }

  deleteTask(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    });
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
