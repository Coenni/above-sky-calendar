import { TestBed } from '@angular/core/testing';
import { TasksStateService } from './tasks-state.service';
import { Task } from '../../models/task.model';

describe('TasksStateService', () => {
  let service: TasksStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TasksStateService]
    });
    service = TestBed.inject(TasksStateService);
  });

  afterEach(() => {
    // Clean up localStorage
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Task Management', () => {
    const mockTask: Task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      status: 'pending',
      rewardPoints: 10,
      orderIndex: 0
    };

    it('should set tasks', () => {
      service.setTasks([mockTask]);
      expect(service.tasks()).toEqual([mockTask]);
    });

    it('should add task', () => {
      service.addTask(mockTask);
      expect(service.tasks()).toContain(mockTask);
    });

    it('should update task', () => {
      service.setTasks([mockTask]);
      service.updateTask(1, { title: 'Updated Task' });
      expect(service.tasks()[0].title).toBe('Updated Task');
    });

    it('should remove task', () => {
      service.setTasks([mockTask]);
      service.removeTask(1);
      expect(service.tasks()).toEqual([]);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      service.setTasks([
        { id: 1, title: 'Task 1', description: '', priority: 'high', status: 'pending', rewardPoints: 10, orderIndex: 0 },
        { id: 2, title: 'Task 2', description: '', priority: 'medium', status: 'completed', rewardPoints: 5, orderIndex: 1 },
        { id: 3, title: 'Task 3', description: '', priority: 'low', status: 'in_progress', rewardPoints: 15, orderIndex: 2 }
      ]);
    });

    it('should filter tasks by status', () => {
      service.setFilter('pending');
      expect(service.filteredTasks().length).toBe(1);
      expect(service.filteredTasks()[0].status).toBe('pending');
    });

    it('should show all tasks when filter is "all"', () => {
      service.setFilter('all');
      expect(service.filteredTasks().length).toBe(3);
    });

    it('should persist filter to localStorage', () => {
      service.setFilter('completed');
      expect(localStorage.getItem('tasks-filter')).toBe('completed');
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      service.setTasks([
        { id: 1, title: 'Task 1', description: '', priority: 'high', status: 'pending', rewardPoints: 10, orderIndex: 0 },
        { id: 2, title: 'Task 2', description: '', priority: 'medium', status: 'completed', rewardPoints: 5, orderIndex: 1 },
        { id: 3, title: 'Task 3', description: '', priority: 'low', status: 'in_progress', rewardPoints: 15, orderIndex: 2 }
      ]);
    });

    it('should compute completed tasks', () => {
      expect(service.completedTasks().length).toBe(1);
      expect(service.completedTasks()[0].status).toBe('completed');
    });

    it('should compute pending tasks', () => {
      expect(service.pendingTasks().length).toBe(1);
      expect(service.pendingTasks()[0].status).toBe('pending');
    });

    it('should compute in progress tasks', () => {
      expect(service.inProgressTasks().length).toBe(1);
      expect(service.inProgressTasks()[0].status).toBe('in_progress');
    });

    it('should compute task stats correctly', () => {
      const stats = service.taskStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.completionRate).toBeCloseTo(33.33, 2);
    });

    it('should compute 0% completion rate when no tasks', () => {
      service.setTasks([]);
      expect(service.taskStats().completionRate).toBe(0);
    });
  });

  describe('Sorting', () => {
    it('should sort tasks by priority', () => {
      service.setTasks([
        { id: 1, title: 'Low Priority', description: '', priority: 'low', status: 'pending', rewardPoints: 10, orderIndex: 0 },
        { id: 2, title: 'High Priority', description: '', priority: 'high', status: 'pending', rewardPoints: 5, orderIndex: 1 },
        { id: 3, title: 'Medium Priority', description: '', priority: 'medium', status: 'pending', rewardPoints: 15, orderIndex: 2 }
      ]);
      service.setSortBy('priority');
      
      const sorted = service.sortedTasks();
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    it('should sort tasks by due date', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      service.setTasks([
        { id: 1, title: 'Task 1', description: '', priority: 'low', status: 'pending', rewardPoints: 10, orderIndex: 0, dueDate: tomorrow },
        { id: 2, title: 'Task 2', description: '', priority: 'high', status: 'pending', rewardPoints: 5, orderIndex: 1, dueDate: yesterday },
        { id: 3, title: 'Task 3', description: '', priority: 'medium', status: 'pending', rewardPoints: 15, orderIndex: 2, dueDate: today }
      ]);
      service.setSortBy('dueDate');
      
      const sorted = service.sortedTasks();
      expect(sorted[0].dueDate).toEqual(yesterday);
      expect(sorted[1].dueDate).toEqual(today);
      expect(sorted[2].dueDate).toEqual(tomorrow);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      service.setLoading(true);
      expect(service.loading()).toBe(true);
      service.setLoading(false);
      expect(service.loading()).toBe(false);
    });

    it('should set error state', () => {
      service.setError('Test error');
      expect(service.error()).toBe('Test error');
      service.setError(null);
      expect(service.error()).toBe(null);
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      service.setTasks([{ id: 1, title: 'Task', description: '', priority: 'high', status: 'pending', rewardPoints: 10, orderIndex: 0 }]);
      service.setLoading(true);
      service.setError('Error');
      service.setFilter('completed');
      
      service.reset();
      
      expect(service.tasks()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(service.error()).toBe(null);
      expect(service.filter()).toBe('all');
    });
  });
});
