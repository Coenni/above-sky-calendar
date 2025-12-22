import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardStateService } from '../../services/state/dashboard-state.service';
import { DashboardApiService } from '../../services/api/dashboard-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { ModeService } from '../../services/mode.service';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Inject services using inject()
  private dashboardState = inject(DashboardStateService);
  private dashboardApi = inject(DashboardApiService);
  protected authState = inject(AuthStateService);
  private eventService = inject(EventService);
  private modeService = inject(ModeService);
  
  // Expose signals to template
  readonly widgets = this.dashboardState.enabledWidgets;
  readonly activities = this.dashboardState.recentActivities;
  readonly loading = this.dashboardState.loading;
  readonly error = this.dashboardState.error;
  readonly currentUser = this.authState.currentUser;
  
  // Mode indicator
  readonly modeIcon = computed(() => {
    const mode = this.modeService.getCurrentModeValue();
    return mode?.isParentMode ? '🔓' : '🔒';
  });
  
  // Local component state
  showCreateForm = signal(false);
  events = signal<Event[]>([]);
  
  newEvent: Event = {
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date()
  };

  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.dashboardState.setLoading(true);
    this.dashboardState.setError(null);
    try {
      // Load recent events
      const events = await this.dashboardApi.getRecentEvents();
      this.events.set(events);
      
      // Add activity for dashboard view
      this.dashboardState.addActivity({
        type: 'view',
        message: 'Dashboard viewed',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.dashboardState.setError('Failed to load dashboard data');
    } finally {
      this.dashboardState.setLoading(false);
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    if (this.showCreateForm()) {
      this.newEvent = {
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date()
      };
    }
  }

  async createEvent(): Promise<void> {
    try {
      const event = await firstValueFrom(this.eventService.createEvent(this.newEvent));
      this.events.update(events => [...events, event]);
      this.dashboardState.addActivity({
        type: 'event',
        message: `Created event: ${event.title}`,
        timestamp: new Date()
      });
      this.toggleCreateForm();
    } catch (error) {
      console.error('Error creating event:', error);
      this.dashboardState.setError('Failed to create event');
    }
  }

  async deleteEvent(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await firstValueFrom(this.eventService.deleteEvent(id));
      this.events.update(events => events.filter(e => e.id !== id));
      this.dashboardState.addActivity({
        type: 'event',
        message: 'Deleted event',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      this.dashboardState.setError('Failed to delete event');
    }
  }

  logout(): void {
    this.authState.logout();
  }
}
