import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarStateService } from '../../services/state/calendar-state.service';
import { CalendarApiService } from '../../services/api/calendar-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  // Inject services using inject()
  private calendarState = inject(CalendarStateService);
  private calendarApi = inject(CalendarApiService);
  protected authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly events = this.calendarState.events;
  readonly loading = this.calendarState.loading;
  readonly error = this.calendarState.error;
  readonly selectedDate = this.calendarState.selectedDate;
  readonly currentMonth = this.calendarState.currentMonth;
  readonly currentMonthName = this.calendarState.currentMonthName;
  readonly daysInMonth = this.calendarState.daysInMonth;
  readonly todayEvents = this.calendarState.todayEvents;
  readonly upcomingEvents = this.calendarState.upcomingEvents;
  
  // Local component state
  showEventForm = signal(false);
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  newEvent: Event = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date()
  };

  ngOnInit(): void {
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.calendarState.setLoading(true);
    this.calendarState.setError(null);
    try {
      const events = await this.calendarApi.getEvents();
      this.calendarState.setEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
      this.calendarState.setError('Failed to load events');
    } finally {
      this.calendarState.setLoading(false);
    }
  }

  previousMonth(): void {
    this.calendarState.previousMonth();
  }

  nextMonth(): void {
    this.calendarState.nextMonth();
  }

  selectDate(date: Date | null): void {
    if (!date) return;
    this.calendarState.setSelectedDate(date);
    this.showEventForm.set(true);
    const currentUser = this.authState.currentUser();
    this.newEvent = {
      title: '',
      description: '',
      startDate: new Date(date),
      endDate: new Date(date),
      userId: currentUser?.id
    };
  }

  closeEventForm(): void {
    this.showEventForm.set(false);
    this.calendarState.setSelectedDate(null);
  }

  async createEvent(): Promise<void> {
    if (!this.newEvent.title) {
      alert('Please enter an event title');
      return;
    }

    try {
      const event = await this.calendarApi.createEvent(this.newEvent);
      this.calendarState.addEvent(event);
      this.closeEventForm();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  }

  getEventsForDate(date: Date | null): Event[] {
    if (!date) return [];
    return this.calendarState.getEventsForDate(date);
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    return this.calendarState.isToday(date);
  }

  isSelected(date: Date | null): boolean {
    if (!date) return false;
    const selected = this.selectedDate();
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  }

  async deleteEvent(id: number | undefined, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    if (!id || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await this.calendarApi.deleteEvent(id);
      this.calendarState.removeEvent(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  }
}
