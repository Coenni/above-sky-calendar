import { Injectable, signal, computed } from '@angular/core';

export interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  enabled: boolean;
  order: number;
}

export interface ActivityItem {
  id?: number;
  type: string;
  message: string;
  timestamp: Date;
  userId?: number;
  userName?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  // Private writable signals
  private _widgets = signal<DashboardWidget[]>([
    { id: 'tasks', title: 'Recent Tasks', type: 'tasks', enabled: true, order: 1 },
    { id: 'calendar', title: 'Upcoming Events', type: 'events', enabled: true, order: 2 },
    { id: 'rewards', title: 'Rewards', type: 'rewards', enabled: true, order: 3 },
    { id: 'meals', title: 'Meal Plan', type: 'meals', enabled: true, order: 4 }
  ]);
  private _activities = signal<ActivityItem[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly widgets = this._widgets.asReadonly();
  readonly activities = this._activities.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed signals
  readonly enabledWidgets = computed(() => 
    this._widgets()
      .filter(w => w.enabled)
      .sort((a, b) => a.order - b.order)
  );
  
  readonly recentActivities = computed(() => 
    this._activities()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  );
  
  readonly todayActivities = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this._activities().filter(activity => {
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });
  });
  
  readonly activityStats = computed(() => ({
    totalActivities: this._activities().length,
    todayActivities: this.todayActivities().length,
    recentActivities: this.recentActivities().length
  }));
  
  constructor() {
    // Load widget configuration from localStorage
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    if (savedWidgets) {
      try {
        this._widgets.set(JSON.parse(savedWidgets));
      } catch (e) {
        // Use default widgets
      }
    }
  }
  
  // Methods to update state
  setActivities(activities: ActivityItem[]) {
    this._activities.set(activities);
  }
  
  addActivity(activity: ActivityItem) {
    this._activities.update(activities => [activity, ...activities]);
  }
  
  setWidgets(widgets: DashboardWidget[]) {
    this._widgets.set(widgets);
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }
  
  toggleWidget(widgetId: string) {
    this._widgets.update(widgets => {
      const updated = widgets.map(w => 
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      );
      localStorage.setItem('dashboard-widgets', JSON.stringify(updated));
      return updated;
    });
  }
  
  reorderWidgets(widgetIds: string[]) {
    this._widgets.update(widgets => {
      const updated = widgets.map(w => {
        const newOrder = widgetIds.indexOf(w.id);
        return { ...w, order: newOrder >= 0 ? newOrder : w.order };
      });
      localStorage.setItem('dashboard-widgets', JSON.stringify(updated));
      return updated;
    });
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  reset() {
    // Reset activities but keep widget configuration
    this._activities.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
