export interface Meal {
  id?: number;
  name: string;
  category: string; // 'breakfast', 'lunch', 'dinner', 'snack'
  recipe?: string;
  ingredients?: string; // JSON string
  assignedDate?: Date;
  mealType?: string; // 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'
  dietaryTags?: string;
  imageUrl?: string;
  isFavorite: boolean;
  icon?: string; // Emoji or icon identifier
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
