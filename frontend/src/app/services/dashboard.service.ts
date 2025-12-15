import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics`);
  }

  getUserMetrics(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics/user/${userId}`);
  }
}
