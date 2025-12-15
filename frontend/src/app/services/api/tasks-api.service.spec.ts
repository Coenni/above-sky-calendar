import { TestBed } from '@angular/core/testing';
import { TasksApiService } from './tasks-api.service';
import { TaskService } from '../task.service';
import { Task } from '../../models/task.model';
import { of } from 'rxjs';

describe('TasksApiService', () => {
  let service: TasksApiService;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    priority: 'high',
    status: 'pending',
    rewardPoints: 10,
    orderIndex: 0
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TaskService', [
      'getAllTasks',
      'getTasksByUser',
      'getTasksByStatus',
      'getTaskById',
      'createTask',
      'updateTask',
      'completeTask',
      'deleteTask'
    ]);

    TestBed.configureTestingModule({
      providers: [
        TasksApiService,
        { provide: TaskService, useValue: spy }
      ]
    });

    service = TestBed.inject(TasksApiService);
    taskServiceSpy = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all tasks', async () => {
    taskServiceSpy.getAllTasks.and.returnValue(of([mockTask]));
    
    const result = await service.getTasks();
    
    expect(result).toEqual([mockTask]);
    expect(taskServiceSpy.getAllTasks).toHaveBeenCalled();
  });

  it('should get tasks by user', async () => {
    taskServiceSpy.getTasksByUser.and.returnValue(of([mockTask]));
    
    const result = await service.getTasksByUser(1);
    
    expect(result).toEqual([mockTask]);
    expect(taskServiceSpy.getTasksByUser).toHaveBeenCalledWith(1);
  });

  it('should get tasks by status', async () => {
    taskServiceSpy.getTasksByStatus.and.returnValue(of([mockTask]));
    
    const result = await service.getTasksByStatus('pending');
    
    expect(result).toEqual([mockTask]);
    expect(taskServiceSpy.getTasksByStatus).toHaveBeenCalledWith('pending');
  });

  it('should get task by id', async () => {
    taskServiceSpy.getTaskById.and.returnValue(of(mockTask));
    
    const result = await service.getTaskById(1);
    
    expect(result).toEqual(mockTask);
    expect(taskServiceSpy.getTaskById).toHaveBeenCalledWith(1);
  });

  it('should create task', async () => {
    taskServiceSpy.createTask.and.returnValue(of(mockTask));
    
    const result = await service.createTask(mockTask);
    
    expect(result).toEqual(mockTask);
    expect(taskServiceSpy.createTask).toHaveBeenCalledWith(mockTask);
  });

  it('should update task', async () => {
    taskServiceSpy.updateTask.and.returnValue(of(mockTask));
    
    const result = await service.updateTask(1, mockTask);
    
    expect(result).toEqual(mockTask);
    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(1, mockTask);
  });

  it('should complete task', async () => {
    const completedTask = { ...mockTask, status: 'completed' };
    taskServiceSpy.completeTask.and.returnValue(of(completedTask));
    
    const result = await service.completeTask(1, 1);
    
    expect(result).toEqual(completedTask);
    expect(taskServiceSpy.completeTask).toHaveBeenCalledWith(1, 1);
  });

  it('should delete task', async () => {
    taskServiceSpy.deleteTask.and.returnValue(of(undefined));
    
    await service.deleteTask(1);
    
    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(1);
  });
});
