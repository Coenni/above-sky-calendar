import { Injectable, signal, computed, effect } from '@angular/core';
import { Meal } from '../../models/meal.model';

@Injectable({ providedIn: 'root' })
export class MealsStateService {
  // Private writable signals
  private _meals = signal<Meal[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedWeek = signal<Date>(this.getStartOfWeek(new Date()));
  private _categoryFilter = signal<string>('all');
  
  // Public readonly signals
  readonly meals = this._meals.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedWeek = this._selectedWeek.asReadonly();
  readonly categoryFilter = this._categoryFilter.asReadonly();
  
  // Computed signals
  readonly weekMeals = computed(() => {
    const weekStart = this._selectedWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return this._meals().filter(meal => {
      if (!meal.assignedDate) return false;
      const mealDate = new Date(meal.assignedDate);
      return mealDate >= weekStart && mealDate < weekEnd;
    });
  });
  
  readonly filteredMeals = computed(() => {
    const meals = this._meals();
    const filter = this._categoryFilter();
    
    if (filter === 'all') return meals;
    if (filter === 'favorite') return meals.filter(m => m.isFavorite);
    return meals.filter(m => m.category === filter);
  });
  
  readonly breakfastMeals = computed(() => 
    this.weekMeals().filter(m => m.category === 'breakfast')
  );
  
  readonly lunchMeals = computed(() => 
    this.weekMeals().filter(m => m.category === 'lunch')
  );
  
  readonly dinnerMeals = computed(() => 
    this.weekMeals().filter(m => m.category === 'dinner')
  );
  
  readonly snackMeals = computed(() => 
    this.weekMeals().filter(m => m.category === 'snack')
  );
  
  readonly favoriteMeals = computed(() => 
    this._meals().filter(m => m.isFavorite)
  );
  
  readonly mealStats = computed(() => ({
    totalMeals: this._meals().length,
    weekMeals: this.weekMeals().length,
    breakfastCount: this.breakfastMeals().length,
    lunchCount: this.lunchMeals().length,
    dinnerCount: this.dinnerMeals().length,
    snackCount: this.snackMeals().length,
    favoritesCount: this.favoriteMeals().length
  }));
  
  readonly shoppingList = computed(() => {
    const ingredients = new Set<string>();
    this.weekMeals().forEach(meal => {
      if (meal.ingredients) {
        try {
          const ingredientList = JSON.parse(meal.ingredients);
          if (Array.isArray(ingredientList)) {
            ingredientList.forEach(ingredient => ingredients.add(ingredient));
          }
        } catch (e) {
          // Handle parse error silently
        }
      }
    });
    return Array.from(ingredients);
  });
  
  constructor() {
    // Persist category filter preference
    const savedFilter = localStorage.getItem('meals-category-filter');
    if (savedFilter) {
      this._categoryFilter.set(savedFilter);
    }
    
    effect(() => {
      const filter = this._categoryFilter();
      localStorage.setItem('meals-category-filter', filter);
    });
  }
  
  // Helper method to get start of week (Sunday)
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
  
  // Methods to update state
  setMeals(meals: Meal[]) {
    this._meals.set(meals);
  }
  
  addMeal(meal: Meal) {
    this._meals.update(meals => [...meals, meal]);
  }
  
  updateMeal(id: number, updates: Partial<Meal>) {
    this._meals.update(meals => 
      meals.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  }
  
  removeMeal(id: number) {
    this._meals.update(meals => meals.filter(m => m.id !== id));
  }
  
  toggleFavorite(id: number) {
    this._meals.update(meals => 
      meals.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)
    );
  }
  
  setSelectedWeek(date: Date) {
    this._selectedWeek.set(this.getStartOfWeek(date));
  }
  
  previousWeek() {
    this._selectedWeek.update(week => {
      const newWeek = new Date(week);
      newWeek.setDate(newWeek.getDate() - 7);
      return newWeek;
    });
  }
  
  nextWeek() {
    this._selectedWeek.update(week => {
      const newWeek = new Date(week);
      newWeek.setDate(newWeek.getDate() + 7);
      return newWeek;
    });
  }
  
  setCategoryFilter(filter: string) {
    this._categoryFilter.set(filter);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  getMealsForDate(date: Date): Meal[] {
    return this._meals().filter(meal => {
      if (!meal.assignedDate) return false;
      const mealDate = new Date(meal.assignedDate);
      return mealDate.toDateString() === date.toDateString();
    });
  }
  
  reset() {
    this._meals.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedWeek.set(this.getStartOfWeek(new Date()));
    this._categoryFilter.set('all');
  }
}
