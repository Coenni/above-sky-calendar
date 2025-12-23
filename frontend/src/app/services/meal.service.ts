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

  getMealsPage(page: number, size: number): Observable<Meal[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Meal[]>(this.apiUrl, { params });
  }

  searchMealsByName(name: string): Observable<Meal[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Meal[]>(`${this.apiUrl}/search`, { params });
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

  assignMealToDate(id: number, date: Date, mealType: string): Observable<Meal> {
    const params = new HttpParams()
      .set('date', date.toISOString().split('T')[0])
      .set('mealType', mealType);
    return this.http.post<Meal>(`${this.apiUrl}/${id}/assign`, null, { params });
  }

  getMealsForCalendar(startDate: Date, endDate: Date): Observable<Meal[]> {
    const params = new HttpParams()
      .set('start', startDate.toISOString().split('T')[0])
      .set('end', endDate.toISOString().split('T')[0]);
    return this.http.get<Meal[]>(`${this.apiUrl}/calendar`, { params });
  }
}
