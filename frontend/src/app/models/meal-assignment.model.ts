export interface MealAssignment {
  id?: number;
  mealId: number;
  assignedDate: string; // ISO date string (YYYY-MM-DD)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal?: {
    id: number;
    name: string;
    category: string;
    icon?: string;
    imageUrl?: string;
  };
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
