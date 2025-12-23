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
  styleUrls: ['./meals.component.scss']
})
export class MealsComponent implements OnInit {
  // Inject services using inject()
  private mealsState = inject(MealsStateService);
  private mealsApi = inject(MealsApiService);
  protected authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly meals = this.mealsState.meals;
  readonly loading = this.mealsState.loading;
  readonly error = this.mealsState.error;
  
  // Local component state
  showMealForm = signal(false);
  showEditModal = signal(false);
  editingMeal = signal<Meal | null>(null);
  searchQuery = signal('');
  selectedCategory = signal('');
  currentPage = signal(0);
  pageSize = 12;
  showImagePreview = signal(false);
  
  newMeal: Meal = {
    name: '',
    category: 'dinner',
    recipe: '',
    ingredients: '',
    isFavorite: false,
    imageUrl: ''
  };
  
  // Computed properties
  readonly filteredMeals = computed(() => {
    let filtered = this.meals();
    
    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(query) ||
        m.ingredients?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }
    
    // Paginate
    const start = this.currentPage() * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });
  
  readonly totalMeals = computed(() => {
    let filtered = this.meals();
    
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(query) ||
        m.ingredients?.toLowerCase().includes(query)
      );
    }
    
    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }
    
    return filtered.length;
  });
  
  readonly pageNumbers = computed(() => {
    const total = this.totalMeals();
    const pages = Math.ceil(total / this.pageSize);
    return Array.from({ length: pages }, (_, i) => i);
  });
  
  readonly paginationEnd = computed(() => {
    return Math.min((this.currentPage() + 1) * this.pageSize, this.totalMeals());
  });
  
  readonly paginationStart = computed(() => {
    return (this.currentPage() * this.pageSize) + 1;
  });

  async ngOnInit(): Promise<void> {
    await this.loadAllMeals();
  }

  async loadAllMeals(): Promise<void> {
    this.mealsState.setLoading(true);
    this.mealsState.setError(null);
    try {
      const meals = await this.mealsApi.getAllMeals();
      this.mealsState.setMeals(meals);
    } catch (error) {
      console.error('Error loading meals:', error);
      this.mealsState.setError('Failed to load meals');
    } finally {
      this.mealsState.setLoading(false);
    }
  }

  toggleMealForm(): void {
    this.showMealForm.update(v => !v);
    this.showImagePreview.set(false);
    if (this.showMealForm()) {
      const currentUser = this.authState.currentUser();
      this.newMeal = {
        name: '',
        category: 'dinner',
        recipe: '',
        ingredients: '',
        isFavorite: false,
        imageUrl: '',
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

  editMeal(meal: Meal): void {
    this.editingMeal.set({ ...meal }); // Create a copy to edit
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingMeal.set(null);
  }

  async saveEditedMeal(): Promise<void> {
    const meal = this.editingMeal();
    if (!meal || !meal.id) return;

    try {
      const updated = await this.mealsApi.updateMeal(meal.id, meal);
      this.mealsState.updateMeal(meal.id, updated);
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('Failed to update meal');
    }
  }

  onSearchChange(): void {
    this.currentPage.set(0); // Reset to first page on search
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(0);
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if ((this.currentPage() + 1) * this.pageSize < this.totalMeals()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  getMealIcon(category: string): string {
    const icons: Record<string, string> = {
      breakfast: '☕',
      lunch: '🍱',
      dinner: '🍽️',
      snack: '🍪'
    };
    return icons[category] || '🍽️';
  }

  previewImage(): void {
    this.showImagePreview.update(v => !v);
  }

  onImageError(): void {
    this.showImagePreview.set(false);
    alert('Unable to load image. Please check the URL.');
  }

  setDefaultImage(event: any): void {
    event.target.style.display = 'none';
  }
}
