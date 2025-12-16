import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RewardService } from '../reward.service';
import { Reward, RewardRedemption } from '../../models/reward.model';

@Injectable({ providedIn: 'root' })
export class RewardsApiService {
  constructor(private rewardService: RewardService) {}
  
  async getAllRewards(): Promise<Reward[]> {
    return firstValueFrom(this.rewardService.getAllRewards());
  }
  
  async getActiveRewards(): Promise<Reward[]> {
    return firstValueFrom(this.rewardService.getActiveRewards());
  }
  
  async getAffordableRewards(userId: number): Promise<Reward[]> {
    return firstValueFrom(this.rewardService.getAffordableRewards(userId));
  }
  
  async getRewardById(id: number): Promise<Reward> {
    return firstValueFrom(this.rewardService.getRewardById(id));
  }
  
  async createReward(reward: Reward): Promise<Reward> {
    return firstValueFrom(this.rewardService.createReward(reward));
  }
  
  async updateReward(id: number, reward: Reward): Promise<Reward> {
    return firstValueFrom(this.rewardService.updateReward(id, reward));
  }
  
  async deleteReward(id: number): Promise<void> {
    return firstValueFrom(this.rewardService.deleteReward(id));
  }
  
  async getUserRedemptions(userId: number): Promise<RewardRedemption[]> {
    return firstValueFrom(this.rewardService.getUserRedemptions(userId));
  }
  
  async redeemReward(userId: number, rewardId: number, notes?: string): Promise<RewardRedemption> {
    return firstValueFrom(this.rewardService.redeemReward(userId, rewardId, notes));
  }
  
  async updateRedemptionStatus(redemptionId: number, status: string): Promise<RewardRedemption> {
    return firstValueFrom(this.rewardService.updateRedemptionStatus(redemptionId, status));
  }
}
