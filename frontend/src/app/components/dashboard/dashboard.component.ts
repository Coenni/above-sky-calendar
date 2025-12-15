import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  events: Event[] = [];
  isLoading = true;
  showCreateForm = false;
  
  newEvent: Event = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date()
  };

  constructor(
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newEvent = {
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date()
      };
    }
  }

  createEvent(): void {
    this.eventService.createEvent(this.newEvent).subscribe({
      next: (event) => {
        this.events.push(event);
        this.toggleCreateForm();
      },
      error: (error) => {
        console.error('Error creating event:', error);
      }
    });
  }

  deleteEvent(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
      },
      error: (error) => {
        console.error('Error deleting event:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
