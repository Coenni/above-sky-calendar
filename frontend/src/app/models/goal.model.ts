export interface Goal {
  id?: number;
  userId: number;
  userName?: string;
  rewardId: number;
  rewardName?: string;
  targetPoints: number;
  period: 'day' | 'week' | 'month';
  currentPoints: number;
  isActive: boolean;
  createdAt?: Date;
  completedAt?: Date;
}
