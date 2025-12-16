import { Injectable, signal, computed, effect } from '@angular/core';
import { Event } from '../../models/event.model';

@Injectable({ providedIn: 'root' })
export class CalendarStateService {
  // Private writable signals
  private _events = signal<Event[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedDate = signal<Date | null>(null);
  private _currentMonth = signal<Date>(new Date());
  private _viewMode = signal<'month' | 'week' | 'day'>('month');
  
  // Public readonly signals
  readonly events = this._events.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedDate = this._selectedDate.asReadonly();
  readonly currentMonth = this._currentMonth.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  
  // Computed signals
  readonly daysInMonth = computed(() => {
    const currentMonth = this._currentMonth();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  });
  
  readonly currentMonthName = computed(() => {
    return this._currentMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  
  readonly eventsForSelectedDate = computed(() => {
    const selectedDate = this._selectedDate();
    if (!selectedDate) return [];
    
    return this._events().filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  });
  
  readonly upcomingEvents = computed(() => {
    const now = new Date();
    return this._events()
      .filter(event => new Date(event.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  });
  
  readonly todayEvents = computed(() => {
    const today = new Date();
    return this._events().filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === today.toDateString();
    });
  });
  
  readonly calendarStats = computed(() => ({
    totalEvents: this._events().length,
    todayEvents: this.todayEvents().length,
    upcomingEvents: this.upcomingEvents().length
  }));
  
  constructor() {
    // Persist view mode preference
    const savedViewMode = localStorage.getItem('calendar-view-mode');
    if (savedViewMode === 'month' || savedViewMode === 'week' || savedViewMode === 'day') {
      this._viewMode.set(savedViewMode);
    }
    
    effect(() => {
      const viewMode = this._viewMode();
      localStorage.setItem('calendar-view-mode', viewMode);
    });
  }
  
  // Methods to update state
  setEvents(events: Event[]) {
    this._events.set(events);
  }
  
  addEvent(event: Event) {
    this._events.update(events => [...events, event]);
  }
  
  updateEvent(id: number, updates: Partial<Event>) {
    this._events.update(events => 
      events.map(e => e.id === id ? { ...e, ...updates } : e)
    );
  }
  
  removeEvent(id: number) {
    this._events.update(events => events.filter(e => e.id !== id));
  }
  
  setSelectedDate(date: Date | null) {
    this._selectedDate.set(date);
  }
  
  setCurrentMonth(month: Date) {
    this._currentMonth.set(month);
  }
  
  previousMonth() {
    this._currentMonth.update(month => 
      new Date(month.getFullYear(), month.getMonth() - 1, 1)
    );
  }
  
  nextMonth() {
    this._currentMonth.update(month => 
      new Date(month.getFullYear(), month.getMonth() + 1, 1)
    );
  }
  
  setViewMode(mode: 'month' | 'week' | 'day') {
    this._viewMode.set(mode);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  getEventsForDate(date: Date): Event[] {
    return this._events().filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  reset() {
    this._events.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedDate.set(null);
    this._currentMonth.set(new Date());
  }
}
