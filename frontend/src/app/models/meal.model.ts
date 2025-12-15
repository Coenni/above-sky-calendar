export interface Meal {
  id?: number;
  name: string;
  category: string; // 'breakfast', 'lunch', 'dinner', 'snack'
  recipe?: string;
  ingredients?: string; // JSON string
  assignedDate?: Date;
  dietaryTags?: string;
  imageUrl?: string;
  isFavorite: boolean;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
