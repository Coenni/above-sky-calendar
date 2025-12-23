export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate?: Date;
  assignedUserId?: number;
  priority: string; // 'high', 'medium', 'low'
  status: string; // 'pending', 'in_progress', 'completed'
  category?: string;
  recurrencePattern?: string;
  rewardPoints: number;
  subtasks?: string; // JSON string
  orderIndex: number;
  icon?: string; // Emoji or icon identifier
  completedAt?: Date;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
