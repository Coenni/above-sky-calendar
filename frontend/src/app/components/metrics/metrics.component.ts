import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css']
})
export class MetricsComponent implements OnInit {
  currentUser: User | null = null;
  events: Event[] = [];
  isLoading = true;

  totalEvents = 0;
  upcomingEvents = 0;
  pastEvents = 0;
  todayEvents = 0;

  constructor(
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.calculateMetrics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  calculateMetrics(): void {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    this.totalEvents = this.events.length;
    this.upcomingEvents = this.events.filter(e => new Date(e.startDate) > now).length;
    this.pastEvents = this.events.filter(e => new Date(e.endDate) < now).length;
    this.todayEvents = this.events.filter(e => {
      const start = new Date(e.startDate);
      return start >= todayStart && start < todayEnd;
    }).length;
  }

  logout(): void {
    this.authService.logout();
  }
}
