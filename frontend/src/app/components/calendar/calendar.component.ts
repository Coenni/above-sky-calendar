import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  events: Event[] = [];
  currentUser: User | null = null;
  isLoading = false;
  currentMonth: Date = new Date();
  selectedDate: Date | null = null;
  showEventForm = false;
  
  daysInMonth: (Date | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  newEvent: Event = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date()
  };

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.generateCalendar();
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    this.daysInMonth = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.daysInMonth.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.daysInMonth.push(new Date(year, month, day));
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  currentMonthName(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  selectDate(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.showEventForm = true;
    this.newEvent = {
      title: '',
      description: '',
      startDate: new Date(date),
      endDate: new Date(date),
      userId: this.currentUser?.id
    };
  }

  closeEventForm(): void {
    this.showEventForm = false;
    this.selectedDate = null;
  }

  createEvent(): void {
    if (!this.newEvent.title) {
      alert('Please enter an event title');
      return;
    }

    this.eventService.createEvent(this.newEvent).subscribe({
      next: (event) => {
        this.events.push(event);
        this.closeEventForm();
      },
      error: (error) => {
        console.error('Error creating event:', error);
        alert('Failed to create event');
      }
    });
  }

  getEventsForDate(date: Date | null): Event[] {
    if (!date) return [];
    
    return this.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }

  deleteEvent(id: number | undefined, event: MouseEvent): void {
    event.stopPropagation();
    if (!id || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    });
  }
}
