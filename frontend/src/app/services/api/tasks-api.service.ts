import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TaskService } from '../task.service';
import { Task } from '../../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  constructor(private taskService: TaskService) {}
  
  async getTasks(): Promise<Task[]> {
    return firstValueFrom(this.taskService.getAllTasks());
  }
  
  async getTasksByUser(userId: number): Promise<Task[]> {
    return firstValueFrom(this.taskService.getTasksByUser(userId));
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    return firstValueFrom(this.taskService.getTasksByStatus(status));
  }
  
  async getTaskById(id: number): Promise<Task> {
    return firstValueFrom(this.taskService.getTaskById(id));
  }
  
  async createTask(task: Task): Promise<Task> {
    return firstValueFrom(this.taskService.createTask(task));
  }
  
  async updateTask(id: number, task: Task): Promise<Task> {
    return firstValueFrom(this.taskService.updateTask(id, task));
  }
  
  async completeTask(id: number, userId: number): Promise<Task> {
    return firstValueFrom(this.taskService.completeTask(id, userId));
  }
  
  async deleteTask(id: number): Promise<void> {
    return firstValueFrom(this.taskService.deleteTask(id));
  }
}
