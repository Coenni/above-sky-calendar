import { Component, OnInit } from '@angular/core';
import { MealService } from '../../services/meal.service';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css']
})
export class MealsComponent implements OnInit {
  meals: Meal[] = [];
  loading = false;
  error: string | null = null;

  get today(): Date {
    return new Date();
  }

  constructor(private mealService: MealService) {}

  ngOnInit(): void {
    this.loadMeals();
  }

  loadMeals(): void {
    this.loading = true;
    this.error = null;
    
    this.mealService.getMeals().subscribe({
      next: (meals) => {
        this.meals = meals;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load meals';
        this.loading = false;
        console.error('Error loading meals:', error);
      }
    });
  }

  deleteMeal(id: number): void {
    if (confirm('Are you sure you want to delete this meal?')) {
      this.mealService.deleteMeal(id).subscribe({
        next: () => {
          this.loadMeals();
        },
        error: (error) => {
          this.error = 'Failed to delete meal';
          console.error('Error deleting meal:', error);
        }
      });
    }
  }
}
