import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meal } from '../models/meal.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private apiUrl = `${environment.apiUrl}/meals`;

  constructor(private http: HttpClient) {}

  getAllMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(this.apiUrl);
  }

  getWeeklyMeals(startDate: Date): Observable<Meal[]> {
    const params = new HttpParams().set('startDate', startDate.toISOString().split('T')[0]);
    return this.http.get<Meal[]>(`${this.apiUrl}/weekly`, { params });
  }

  getFavoriteMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/favorites`);
  }

  getMealsByCategory(category: string): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/category/${category}`);
  }

  getMealById(id: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.apiUrl}/${id}`);
  }

  createMeal(meal: Meal): Observable<Meal> {
    return this.http.post<Meal>(this.apiUrl, meal);
  }

  updateMeal(id: number, meal: Meal): Observable<Meal> {
    return this.http.put<Meal>(`${this.apiUrl}/${id}`, meal);
  }

  deleteMeal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
