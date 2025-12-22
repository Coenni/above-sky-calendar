# Angular Signals Migration Guide

## Overview

This document describes the migration of the Above Sky Calendar application from traditional RxJS-based state management to Angular Signals for improved performance and maintainability.

## What Are Signals?

Signals are a reactive primitive introduced in Angular 16/17 that provide:
- **Fine-grained reactivity**: Only affected components update when values change
- **Synchronous updates**: No need for change detection zones
- **Better TypeScript inference**: Improved type safety
- **Simpler mental model**: Easier to understand than Observables for UI state

## Migration Strategy

### 1. State Services (Signal-Based)

We created dedicated state services for each feature domain using Signals:

- `TasksStateService` - Manages tasks state
- `CalendarStateService` - Manages calendar events and date selection
- `RewardsStateService` - Manages rewards and redemptions
- `MealsStateService` - Manages meal plans
- `PhotosStateService` - Manages photo gallery
- `ListsStateService` - Manages family lists
- `AuthStateService` - Manages authentication state
- `DashboardStateService` - Manages dashboard widgets and activities

**Key Patterns:**

```typescript
@Injectable({ providedIn: 'root' })
export class TasksStateService {
  // Private writable signals
  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed signals (auto-update when dependencies change)
  readonly completedTasks = computed(() => 
    this._tasks().filter(t => t.status === 'completed')
  );
  
  readonly taskStats = computed(() => ({
    total: this._tasks().length,
    completed: this.completedTasks().length,
    completionRate: this._tasks().length > 0 
      ? (this.completedTasks().length / this._tasks().length) * 100 
      : 0
  }));
  
  // State update methods
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
}
```

### 2. API Services (RxJS to Promise Wrappers)

We created API service wrappers that convert RxJS Observables to Promises using `firstValueFrom()`:

```typescript
@Injectable({ providedIn: 'root' })
export class TasksApiService {
  constructor(private taskService: TaskService) {}
  
  async getTasks(): Promise<Task[]> {
    return firstValueFrom(this.taskService.getAllTasks());
  }
  
  async createTask(task: Task): Promise<Task> {
    return firstValueFrom(this.taskService.createTask(task));
  }
}
```

**Why this approach?**
- HTTP calls remain asynchronous (appropriate use case for RxJS)
- Promises are easier to use with async/await
- Keeps existing HTTP service layer intact
- Clean separation of concerns

### 3. Component Updates

Components now use the `inject()` function and signals:

**Before (RxJS approach):**

```typescript
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  isLoading = false;
  
  constructor(private taskService: TaskService) {}
  
  ngOnInit() {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      }
    });
  }
}
```

**After (Signals approach):**

```typescript
export class TasksComponent implements OnInit {
  // Inject services using inject()
  private tasksState = inject(TasksStateService);
  private tasksApi = inject(TasksApiService);
  
  // Expose signals to template
  readonly sortedTasks = this.tasksState.sortedTasks;
  readonly loading = this.tasksState.loading;
  readonly stats = this.tasksState.taskStats;
  
  async ngOnInit() {
    await this.loadTasks();
  }
  
  async loadTasks() {
    this.tasksState.setLoading(true);
    try {
      const tasks = await this.tasksApi.getTasks();
      this.tasksState.setTasks(tasks);
    } catch (error) {
      this.tasksState.setError('Failed to load tasks');
    } finally {
      this.tasksState.setLoading(false);
    }
  }
}
```

### 4. Template Updates

We migrated to Angular 17's new control flow syntax:

**Before (*ngIf):**
```html
<div *ngIf="isLoading">Loading...</div>
<div *ngIf="error">{{ error }}</div>
```

**After (@if):**
```html
@if (loading()) {
  <div>Loading...</div>
}
@if (error()) {
  <div>{{ error() }}</div>
}
```

**Before (*ngFor):**
```html
<div *ngFor="let task of tasks">{{ task.title }}</div>
```

**After (@for with @empty):**
```html
@for (task of sortedTasks(); track task.id) {
  <div>{{ task.title }}</div>
} @empty {
  <div>No tasks found</div>
}
```

## Benefits Achieved

### 1. Performance Improvements
- **Fine-grained updates**: Only components using changed signals re-render
- **Reduced Zone.js overhead**: Signals don't trigger zone change detection
- **Computed signal caching**: Computed values only recalculate when dependencies change

### 2. Developer Experience
- **Better TypeScript inference**: Signals provide excellent type safety
- **Simpler debugging**: Synchronous updates are easier to trace
- **Less boilerplate**: No need for manual subscriptions and unsubscriptions
- **Clearer data flow**: State changes are explicit and trackable

### 3. Code Maintainability
- **Centralized state**: All feature state in dedicated services
- **Separation of concerns**: State management vs. API calls vs. UI logic
- **Testability**: State services are easy to test in isolation
- **Consistency**: Same patterns used across all features

## Effects for Side Effects

Effects run automatically when signals change:

```typescript
constructor() {
  // Persist filter preference
  effect(() => {
    const filter = this._filter();
    localStorage.setItem('tasks-filter', filter);
  });
  
  // Log in development
  if (!environment.production) {
    effect(() => {
      console.log('Tasks updated:', this._tasks());
    });
  }
}
```

## Best Practices

### 1. Signal Naming
- Private writable signals: `_signalName`
- Public readonly signals: `signalName` (exposed via `asReadonly()`)
- Computed signals: descriptive names (`taskStats`, `sortedTasks`)

### 2. State Updates
- Use `set()` for complete replacement
- Use `update()` for modifications based on current value
- Keep updates immutable (create new arrays/objects)

### 3. When to Use RxJS
- HTTP requests
- WebSocket connections
- Complex async workflows
- Event streams
- Timer-based operations

### 4. When to Use Signals
- UI state
- Synchronous derived state
- Component local state
- Feature state management
- Form state

## Migration Checklist

For each component:

1. ✅ Create/update state service with signals
2. ✅ Create/update API service (RxJS to Promise wrapper)
3. ✅ Update component to use `inject()` instead of constructor injection
4. ✅ Replace component properties with signal references
5. ✅ Update methods to use async/await with API services
6. ✅ Update methods to call state service update methods
7. ✅ Update template to use `()` for signal calls
8. ✅ Replace `*ngIf` with `@if`
9. ✅ Replace `*ngFor` with `@for`
10. ✅ Test component functionality
11. ✅ Verify build passes
12. ✅ Update tests

## Components Migrated

- [x] TasksComponent - Full migration complete ✅
- [x] CalendarComponent - Full migration complete ✅
- [x] PhotosComponent - Full migration complete ✅
- [x] RewardsComponent - Full migration complete ✅
- [x] MealsComponent - Full migration complete ✅
- [x] ListsComponent - Full migration complete ✅
- [x] DashboardComponent - Full migration complete ✅

## Migration Complete! 🎉

All components now follow the 3-layer architecture pattern:
- Component → State Service → API Service → Backend

All components use:
- ✅ Angular Signals for state management
- ✅ `inject()` function for dependency injection
- ✅ New control flow syntax (`@if`, `@for`)
- ✅ Async/await with Promises
- ✅ Centralized state services
- ✅ Fine-grained reactivity

The migration is complete and the application successfully builds!

## Testing Strategy

### Unit Testing State Services

```typescript
describe('TasksStateService', () => {
  let service: TasksStateService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TasksStateService]
    });
    service = TestBed.inject(TasksStateService);
  });
  
  it('should add task', () => {
    const task: Task = { id: 1, title: 'Test', /* ... */ };
    service.addTask(task);
    expect(service.tasks()).toContain(task);
  });
  
  it('should compute stats correctly', () => {
    service.setTasks([
      { id: 1, status: 'completed', /* ... */ },
      { id: 2, status: 'pending', /* ... */ }
    ]);
    const stats = service.taskStats();
    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
  });
});
```

### Component Testing

```typescript
describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let tasksState: TasksStateService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [TasksStateService, TasksApiService]
    });
    
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    tasksState = TestBed.inject(TasksStateService);
  });
  
  it('should display tasks from state', () => {
    tasksState.setTasks([
      { id: 1, title: 'Test Task', status: 'pending', /* ... */ }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Task');
  });
});
```

## Common Patterns

### Loading States
```typescript
// In component
async loadData() {
  this.state.setLoading(true);
  this.state.setError(null);
  try {
    const data = await this.api.getData();
    this.state.setData(data);
  } catch (error) {
    this.state.setError('Failed to load data');
  } finally {
    this.state.setLoading(false);
  }
}
```

### Filtering and Sorting
```typescript
// In state service
readonly filteredItems = computed(() => {
  const items = this._items();
  const filter = this._filter();
  return filter === 'all' ? items : items.filter(i => i.type === filter);
});

readonly sortedItems = computed(() => {
  const items = [...this.filteredItems()];
  const sortBy = this._sortBy();
  return items.sort((a, b) => /* sorting logic */);
});
```

### Form Handling
```typescript
// In component
showForm = signal(false);
formData = signal({ name: '', email: '' });

updateFormField(field: string, value: any) {
  this.formData.update(data => ({ ...data, [field]: value }));
}

isValid = computed(() => {
  const data = this.formData();
  return data.name.length > 0 && data.email.includes('@');
});
```

## Resources

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Angular New Control Flow](https://angular.io/guide/control_flow)
- [RxJS Interop with Signals](https://angular.io/guide/rxjs-interop)

## Notes

- Signals are synchronous - perfect for UI state
- RxJS remains essential for async operations
- Migration is incremental - both patterns can coexist
- Performance gains are most noticeable in large applications
- Use effects sparingly - prefer computed signals when possible
