import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { EventService } from '../event.service';
import { Event } from '../../models/event.model';
import { ActivityItem } from '../state/dashboard-state.service';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(
    private dashboardService: DashboardService,
    private eventService: EventService
  ) {}
  
  async getDashboardMetrics(): Promise<any> {
    return firstValueFrom(this.dashboardService.getDashboardMetrics());
  }
  
  async getUserMetrics(userId: number): Promise<any> {
    return firstValueFrom(this.dashboardService.getUserMetrics(userId));
  }
  
  async getRecentEvents(): Promise<Event[]> {
    return firstValueFrom(this.eventService.getEvents());
  }
}
