import { Injectable, signal, computed, effect } from '@angular/core';
import { Reward, RewardRedemption } from '../../models/reward.model';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class RewardsStateService {
  // Private writable signals
  private _rewards = signal<Reward[]>([]);
  private _redemptions = signal<RewardRedemption[]>([]);
  private _userPoints = signal(0);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _filter = signal<string>('all');
  
  // Public readonly signals
  readonly rewards = this._rewards.asReadonly();
  readonly redemptions = this._redemptions.asReadonly();
  readonly userPoints = this._userPoints.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filter = this._filter.asReadonly();
  
  // Computed signals
  readonly availableRewards = computed(() => 
    this._rewards().filter(r => r.isActive)
  );
  
  readonly affordableRewards = computed(() => 
    this.availableRewards().filter(r => r.pointsCost <= this._userPoints())
  );
  
  readonly filteredRewards = computed(() => {
    const rewards = this.availableRewards();
    const filter = this._filter();
    
    if (filter === 'all') return rewards;
    if (filter === 'affordable') return this.affordableRewards();
    return rewards.filter(r => r.category === filter);
  });
  
  readonly pendingRedemptions = computed(() => 
    this._redemptions().filter(r => r.status === 'pending')
  );
  
  readonly approvedRedemptions = computed(() => 
    this._redemptions().filter(r => r.status === 'approved')
  );
  
  readonly rewardStats = computed(() => ({
    totalRewards: this._rewards().length,
    availableRewards: this.availableRewards().length,
    affordableRewards: this.affordableRewards().length,
    userPoints: this._userPoints(),
    totalRedemptions: this._redemptions().length,
    pendingRedemptions: this.pendingRedemptions().length
  }));
  
  constructor() {
    // Persist filter preference
    const savedFilter = localStorage.getItem('rewards-filter');
    if (savedFilter) {
      this._filter.set(savedFilter);
    }
    
    effect(() => {
      const filter = this._filter();
      localStorage.setItem('rewards-filter', filter);
    });
  }
  
  // Methods to update state
  setRewards(rewards: Reward[]) {
    this._rewards.set(rewards);
  }
  
  addReward(reward: Reward) {
    this._rewards.update(rewards => [...rewards, reward]);
  }
  
  updateReward(id: number, updates: Partial<Reward>) {
    this._rewards.update(rewards => 
      rewards.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }
  
  removeReward(id: number) {
    this._rewards.update(rewards => rewards.filter(r => r.id !== id));
  }
  
  setRedemptions(redemptions: RewardRedemption[]) {
    this._redemptions.set(redemptions);
  }
  
  addRedemption(redemption: RewardRedemption) {
    this._redemptions.update(redemptions => [...redemptions, redemption]);
    // Deduct points when redeeming
    this._userPoints.update(points => points - redemption.pointsSpent);
  }
  
  updateRedemption(id: number, updates: Partial<RewardRedemption>) {
    this._redemptions.update(redemptions => 
      redemptions.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }
  
  setUserPoints(points: number) {
    this._userPoints.set(points);
  }
  
  addPoints(points: number) {
    this._userPoints.update(current => current + points);
  }
  
  setFilter(filter: string) {
    this._filter.set(filter);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  canAfford(reward: Reward): boolean {
    return this._userPoints() >= reward.pointsCost;
  }
  
  reset() {
    this._rewards.set([]);
    this._redemptions.set([]);
    this._userPoints.set(0);
    this._loading.set(false);
    this._error.set(null);
    this._filter.set('all');
  }
}
