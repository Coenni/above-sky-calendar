import { Injectable, signal, computed, effect } from '@angular/core';
import { Task } from '../../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksStateService {
  // Private writable signals
  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _filter = signal<string>('all');
  private _sortBy = signal<'dueDate' | 'priority' | 'created'>('dueDate');
  
  // Public readonly signals
  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();
  
  // Computed signals
  readonly filteredTasks = computed(() => {
    const tasks = this._tasks();
    const filter = this._filter();
    return filter === 'all' 
      ? tasks 
      : tasks.filter(t => t.status === filter);
  });
  
  readonly completedTasks = computed(() => 
    this._tasks().filter(t => t.status === 'completed')
  );
  
  readonly pendingTasks = computed(() => 
    this._tasks().filter(t => t.status === 'pending')
  );
  
  readonly inProgressTasks = computed(() => 
    this._tasks().filter(t => t.status === 'in_progress')
  );
  
  readonly taskStats = computed(() => ({
    total: this._tasks().length,
    completed: this.completedTasks().length,
    pending: this.pendingTasks().length,
    inProgress: this.inProgressTasks().length,
    completionRate: this._tasks().length > 0 
      ? (this.completedTasks().length / this._tasks().length) * 100 
      : 0
  }));
  
  readonly sortedTasks = computed(() => {
    const tasks = [...this.filteredTasks()];
    const sortBy = this._sortBy();
    
    return tasks.sort((a, b) => {
      if (sortBy === 'dueDate' && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      } else if (sortBy === 'created' && a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  });
  
  constructor() {
    // Persist filter preference
    const savedFilter = localStorage.getItem('tasks-filter');
    if (savedFilter) {
      this._filter.set(savedFilter);
    }
    
    effect(() => {
      const filter = this._filter();
      localStorage.setItem('tasks-filter', filter);
    });
  }
  
  // Methods to update state
  setTasks(tasks: Task[]) {
    this._tasks.set(tasks);
  }
  
  addTask(task: Task) {
    this._tasks.update(tasks => [...tasks, task]);
  }
  
  updateTask(id: number, updates: Partial<Task>) {
    this._tasks.update(tasks => 
      tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }
  
  removeTask(id: number) {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }
  
  setFilter(filter: string) {
    this._filter.set(filter);
  }
  
  setSortBy(sortBy: 'dueDate' | 'priority' | 'created') {
    this._sortBy.set(sortBy);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  reset() {
    this._tasks.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._filter.set('all');
  }
}
