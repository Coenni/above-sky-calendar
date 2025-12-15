import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MealService } from '../meal.service';
import { Meal } from '../../models/meal.model';

@Injectable({ providedIn: 'root' })
export class MealsApiService {
  constructor(private mealService: MealService) {}
  
  async getAllMeals(): Promise<Meal[]> {
    return firstValueFrom(this.mealService.getAllMeals());
  }
  
  async getWeeklyMeals(startDate: Date): Promise<Meal[]> {
    return firstValueFrom(this.mealService.getWeeklyMeals(startDate));
  }
  
  async getFavoriteMeals(): Promise<Meal[]> {
    return firstValueFrom(this.mealService.getFavoriteMeals());
  }
  
  async getMealsByCategory(category: string): Promise<Meal[]> {
    return firstValueFrom(this.mealService.getMealsByCategory(category));
  }
  
  async getMealById(id: number): Promise<Meal> {
    return firstValueFrom(this.mealService.getMealById(id));
  }
  
  async createMeal(meal: Meal): Promise<Meal> {
    return firstValueFrom(this.mealService.createMeal(meal));
  }
  
  async updateMeal(id: number, meal: Meal): Promise<Meal> {
    return firstValueFrom(this.mealService.updateMeal(id, meal));
  }
  
  async deleteMeal(id: number): Promise<void> {
    return firstValueFrom(this.mealService.deleteMeal(id));
  }
}
