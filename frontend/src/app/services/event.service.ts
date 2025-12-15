import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private apiService: ApiService) {}

  getEvents(): Observable<Event[]> {
    return this.apiService.get<Event[]>('/events');
  }

  getEvent(id: number): Observable<Event> {
    return this.apiService.get<Event>(`/events/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.apiService.post<Event>('/events', event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.apiService.put<Event>(`/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.apiService.delete<void>(`/events/${id}`);
  }
}
