import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MealsStateService } from '../../services/state/meals-state.service';
import { MealsApiService } from '../../services/api/meals-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css']
})
export class MealsComponent implements OnInit {
  // Inject services using inject()
  private mealsState = inject(MealsStateService);
  private mealsApi = inject(MealsApiService);
  protected authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly meals = this.mealsState.meals;
  readonly weekMeals = this.mealsState.weekMeals;
  readonly loading = this.mealsState.loading;
  readonly error = this.mealsState.error;
  readonly selectedWeek = this.mealsState.selectedWeek;
  readonly breakfastMeals = this.mealsState.breakfastMeals;
  readonly lunchMeals = this.mealsState.lunchMeals;
  readonly dinnerMeals = this.mealsState.dinnerMeals;
  readonly snackMeals = this.mealsState.snackMeals;
  
  // Local component state
  showMealForm = signal(false);
  
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  newMeal: Meal = {
    name: '',
    category: 'dinner',
    recipe: '',
    ingredients: '',
    isFavorite: false
  };
  
  // Computed signals for meal organization
  readonly weeklyMealsMap = computed(() => {
    const weekStart = this.selectedWeek();
    const mealsMap = new Map<string, Meal[]>();
    
    // Initialize all days with empty arrays
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const key = this.formatDate(date);
      mealsMap.set(key, []);
    }
    
    // Fill in meals
    this.weekMeals().forEach(meal => {
      if (meal.assignedDate) {
        const key = this.formatDate(new Date(meal.assignedDate));
        const dayMeals = mealsMap.get(key) || [];
        dayMeals.push(meal);
        mealsMap.set(key, dayMeals);
      }
    });
    
    return mealsMap;
  });

  async ngOnInit(): Promise<void> {
    await this.loadWeeklyMeals();
  }

  async loadWeeklyMeals(): Promise<void> {
    this.mealsState.setLoading(true);
    this.mealsState.setError(null);
    try {
      const startDate = this.selectedWeek();
      const meals = await this.mealsApi.getWeeklyMeals(startDate);
      this.mealsState.setMeals(meals);
    } catch (error) {
      console.error('Error loading meals:', error);
      this.mealsState.setError('Failed to load meals');
    } finally {
      this.mealsState.setLoading(false);
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getDateForDay(dayIndex: number): Date {
    const weekStart = this.selectedWeek();
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    return date;
  }

  getMealsForDay(dayIndex: number): Meal[] {
    const date = this.getDateForDay(dayIndex);
    const key = this.formatDate(date);
    return this.weeklyMealsMap().get(key) || [];
  }

  getMealsByType(dayIndex: number, mealType: string): Meal[] {
    const dayMeals = this.getMealsForDay(dayIndex);
    return dayMeals.filter(m => m.category === mealType);
  }

  async previousWeek(): Promise<void> {
    this.mealsState.previousWeek();
    await this.loadWeeklyMeals();
  }

  async nextWeek(): Promise<void> {
    this.mealsState.nextWeek();
    await this.loadWeeklyMeals();
  }

  async currentWeek(): Promise<void> {
    this.mealsState.setSelectedWeek(new Date());
    await this.loadWeeklyMeals();
  }

  toggleMealForm(): void {
    this.showMealForm.update(v => !v);
    if (this.showMealForm()) {
      const currentUser = this.authState.currentUser();
      this.newMeal = {
        name: '',
        category: 'dinner',
        recipe: '',
        ingredients: '',
        isFavorite: false,
        createdBy: currentUser?.id
      };
    }
  }

  async createMeal(): Promise<void> {
    if (!this.newMeal.name) {
      alert('Please enter a meal name');
      return;
    }

    try {
      const meal = await this.mealsApi.createMeal(this.newMeal);
      this.mealsState.addMeal(meal);
      this.toggleMealForm();
    } catch (error) {
      console.error('Error creating meal:', error);
      alert('Failed to create meal');
    }
  }

  async deleteMeal(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      await this.mealsApi.deleteMeal(id);
      this.mealsState.removeMeal(id);
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal');
    }
  }

  getWeekDateRange(): string {
    const weekStart = this.selectedWeek();
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}
