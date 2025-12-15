import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MealService } from '../../services/meal.service';
import { AuthService } from '../../services/auth.service';
import { Meal } from '../../models/meal.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css']
})
export class MealsComponent implements OnInit {
  meals: Meal[] = [];
  weeklyMeals: Map<string, Meal[]> = new Map();
  currentUser: User | null = null;
  isLoading = false;
  showMealForm = false;
  currentWeekStart: Date = new Date();
  
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  newMeal: Meal = {
    name: '',
    category: 'dinner',
    recipe: '',
    ingredients: '',
    isFavorite: false
  };

  constructor(
    private mealService: MealService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.setWeekStart();
    this.loadWeeklyMeals();
  }

  setWeekStart(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() - dayOfWeek);
    this.currentWeekStart.setHours(0, 0, 0, 0);
  }

  loadWeeklyMeals(): void {
    this.isLoading = true;
    this.mealService.getWeeklyMeals(this.currentWeekStart).subscribe({
      next: (meals) => {
        this.meals = meals;
        this.organizeWeeklyMeals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading meals:', error);
        this.isLoading = false;
      }
    });
  }

  organizeWeeklyMeals(): void {
    this.weeklyMeals.clear();
    
    // Initialize all days with empty arrays
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      const key = this.formatDate(date);
      this.weeklyMeals.set(key, []);
    }
    
    // Fill in meals
    this.meals.forEach(meal => {
      if (meal.assignedDate) {
        const key = this.formatDate(new Date(meal.assignedDate));
        const dayMeals = this.weeklyMeals.get(key) || [];
        dayMeals.push(meal);
        this.weeklyMeals.set(key, dayMeals);
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getDateForDay(dayIndex: number): Date {
    const date = new Date(this.currentWeekStart);
    date.setDate(this.currentWeekStart.getDate() + dayIndex);
    return date;
  }

  getMealsForDay(dayIndex: number): Meal[] {
    const date = this.getDateForDay(dayIndex);
    const key = this.formatDate(date);
    return this.weeklyMeals.get(key) || [];
  }

  getMealsByType(dayIndex: number, mealType: string): Meal[] {
    const dayMeals = this.getMealsForDay(dayIndex);
    return dayMeals.filter(m => m.category === mealType);
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.loadWeeklyMeals();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.loadWeeklyMeals();
  }

  currentWeek(): void {
    this.setWeekStart();
    this.loadWeeklyMeals();
  }

  toggleMealForm(): void {
    this.showMealForm = !this.showMealForm;
    if (this.showMealForm) {
      this.newMeal = {
        name: '',
        category: 'dinner',
        recipe: '',
        ingredients: '',
        isFavorite: false,
        createdBy: this.currentUser?.id
      };
    }
  }

  createMeal(): void {
    if (!this.newMeal.name) {
      alert('Please enter a meal name');
      return;
    }

    this.mealService.createMeal(this.newMeal).subscribe({
      next: (meal) => {
        this.meals.push(meal);
        this.organizeWeeklyMeals();
        this.toggleMealForm();
      },
      error: (error) => {
        console.error('Error creating meal:', error);
        alert('Failed to create meal');
      }
    });
  }

  deleteMeal(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    this.mealService.deleteMeal(id).subscribe({
      next: () => {
        this.meals = this.meals.filter(m => m.id !== id);
        this.organizeWeeklyMeals();
      },
      error: (error) => {
        console.error('Error deleting meal:', error);
        alert('Failed to delete meal');
      }
    });
  }

  getWeekDateRange(): string {
    const end = new Date(this.currentWeekStart);
    end.setDate(this.currentWeekStart.getDate() + 6);
    return `${this.currentWeekStart.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}
