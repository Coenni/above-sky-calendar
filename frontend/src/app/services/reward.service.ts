import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reward, RewardRedemption } from '../models/reward.model';

@Injectable({
  providedIn: 'root'
})
export class RewardService {
  private apiUrl = '/api/rewards';

  constructor(private http: HttpClient) {}

  getAllRewards(): Observable<Reward[]> {
    return this.http.get<Reward[]>(this.apiUrl);
  }

  getActiveRewards(): Observable<Reward[]> {
    return this.http.get<Reward[]>(`${this.apiUrl}/active`);
  }

  getAffordableRewards(userId: number): Observable<Reward[]> {
    return this.http.get<Reward[]>(`${this.apiUrl}/affordable/${userId}`);
  }

  getRewardById(id: number): Observable<Reward> {
    return this.http.get<Reward>(`${this.apiUrl}/${id}`);
  }

  createReward(reward: Reward): Observable<Reward> {
    return this.http.post<Reward>(this.apiUrl, reward);
  }

  updateReward(id: number, reward: Reward): Observable<Reward> {
    return this.http.put<Reward>(`${this.apiUrl}/${id}`, reward);
  }

  deleteReward(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Redemption methods
  getUserRedemptions(userId: number): Observable<RewardRedemption[]> {
    return this.http.get<RewardRedemption[]>(`${this.apiUrl}/redemptions/user/${userId}`);
  }

  redeemReward(userId: number, rewardId: number, notes?: string): Observable<RewardRedemption> {
    return this.http.post<RewardRedemption>(`${this.apiUrl}/redeem`, {
      userId,
      rewardId,
      notes
    });
  }

  updateRedemptionStatus(redemptionId: number, status: string): Observable<RewardRedemption> {
    return this.http.put<RewardRedemption>(`${this.apiUrl}/redemptions/${redemptionId}/status`, { status });
  }
}
