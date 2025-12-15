import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../event.service';
import { Event } from '../../models/event.model';

@Injectable({ providedIn: 'root' })
export class CalendarApiService {
  constructor(private eventService: EventService) {}
  
  async getEvents(): Promise<Event[]> {
    return firstValueFrom(this.eventService.getEvents());
  }
  
  async getEvent(id: number): Promise<Event> {
    return firstValueFrom(this.eventService.getEvent(id));
  }
  
  async createEvent(event: Event): Promise<Event> {
    return firstValueFrom(this.eventService.createEvent(event));
  }
  
  async updateEvent(id: number, event: Event): Promise<Event> {
    return firstValueFrom(this.eventService.updateEvent(id, event));
  }
  
  async deleteEvent(id: number): Promise<void> {
    return firstValueFrom(this.eventService.deleteEvent(id));
  }
}
