export interface Reward {
  id?: number;
  name: string;
  description: string;
  pointsCost: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  stockQuantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RewardRedemption {
  id?: number;
  userId: number;
  rewardId: number;
  pointsSpent: number;
  status: string; // 'pending', 'approved', 'fulfilled', 'cancelled'
  notes?: string;
  redeemedAt?: Date;
}
