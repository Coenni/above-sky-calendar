import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RewardsStateService } from '../../services/state/rewards-state.service';
import { RewardsApiService } from '../../services/api/rewards-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { ModeService } from '../../services/mode.service';
import { Reward } from '../../models/reward.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {
  // Inject services using inject()
  private rewardsState = inject(RewardsStateService);
  private rewardsApi = inject(RewardsApiService);
  protected authState = inject(AuthStateService);
  private modeService = inject(ModeService);
  
  // Expose signals to template
  readonly rewards = this.rewardsState.filteredRewards;
  readonly loading = this.rewardsState.loading;
  readonly error = this.rewardsState.error;
  readonly userPoints = this.rewardsState.userPoints;
  readonly redemptions = this.rewardsState.redemptions;
  readonly filterValue = this.rewardsState.filter;
  
  // Check if in Parent Mode (buttons should be visible)
  readonly isParentMode = computed(() => this.modeService.isParentMode());
  
  // Local component state
  showRedeemModal = signal(false);
  selectedReward = signal<Reward | null>(null);
  redemptionNotes = signal('');
  searchQuery = signal('');
  showHistory = signal(false);
  showAddRewardForm = signal(false);
  showSetGoalForm = signal(false);
  
  newReward: Partial<Reward> = {
    name: '',
    description: '',
    pointsCost: 0,
    category: '',
    imageUrl: ''
  };
  
  userGoal = signal<number>(0);
  
  // Computed signals
  readonly filteredBySearch = computed(() => {
    const rewards = this.rewards();
    const query = this.searchQuery().trim().toLowerCase();
    
    if (!query) return rewards;
    
    return rewards.filter(r => 
      r.name.toLowerCase().includes(query) || 
      r.description.toLowerCase().includes(query)
    );
  });
  
  readonly uniqueCategories = computed(() => {
    const rewards = this.rewardsState.rewards();
    const categories = new Set(rewards.map(r => r.category).filter(c => c));
    return Array.from(categories) as string[];
  });

  async ngOnInit(): Promise<void> {
    const currentUser = this.authState.currentUser();
    if (currentUser) {
      await this.loadRewards();
      this.loadUserPoints();
    }
  }

  async loadRewards(): Promise<void> {
    this.rewardsState.setLoading(true);
    this.rewardsState.setError(null);
    try {
      const rewards = await this.rewardsApi.getAllRewards();
      this.rewardsState.setRewards(rewards);
    } catch (error) {
      console.error('Error loading rewards:', error);
      this.rewardsState.setError('Failed to load rewards');
    } finally {
      this.rewardsState.setLoading(false);
    }
  }

  loadUserPoints(): void {
    const currentUser = this.authState.currentUser();
    if (currentUser?.id) {
      // For now, use the points from the user object
      // In production, this would fetch from the API
      this.rewardsState.setUserPoints(currentUser.rewardPoints || 0);
    }
  }

  async loadRedemptionHistory(): Promise<void> {
    const currentUser = this.authState.currentUser();
    if (currentUser?.id) {
      try {
        const history = await this.rewardsApi.getUserRedemptions(currentUser.id);
        this.rewardsState.setRedemptions(history);
      } catch (error) {
        console.error('Error loading redemption history:', error);
      }
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onCategoryChange(category: string): void {
    this.rewardsState.setFilter(category);
  }

  canAfford(reward: Reward): boolean {
    return this.rewardsState.canAfford(reward);
  }

  openRedeemModal(reward: Reward): void {
    if (!this.canAfford(reward)) {
      const pointsNeeded = reward.pointsCost - this.userPoints();
      alert(`You need ${pointsNeeded} more points to redeem this reward.`);
      return;
    }
    this.selectedReward.set(reward);
    this.redemptionNotes.set('');
    this.showRedeemModal.set(true);
  }

  closeRedeemModal(): void {
    this.showRedeemModal.set(false);
    this.selectedReward.set(null);
    this.redemptionNotes.set('');
  }

  async confirmRedemption(): Promise<void> {
    const reward = this.selectedReward();
    const currentUser = this.authState.currentUser();
    
    if (!reward || !currentUser?.id) return;

    try {
      const redemption = await this.rewardsApi.redeemReward(
        currentUser.id, 
        reward.id!, 
        this.redemptionNotes()
      );
      
      alert('Reward redeemed successfully! Your redemption is pending approval.');
      this.rewardsState.addRedemption(redemption);
      // Update auth state user points
      this.authState.updateUserPoints(this.userPoints());
      this.closeRedeemModal();
      await this.loadRedemptionHistory();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  }

  async toggleHistory(): Promise<void> {
    this.showHistory.update(v => !v);
    if (this.showHistory() && this.redemptions().length === 0) {
      await this.loadRedemptionHistory();
    }
  }

  getUniqueCategories(): string[] {
    return this.uniqueCategories();
  }
  
  // Add Reward functionality
  toggleAddRewardForm(): void {
    this.showAddRewardForm.update(v => !v);
    if (!this.showAddRewardForm()) {
      this.resetRewardForm();
    }
  }
  
  resetRewardForm(): void {
    this.newReward = {
      name: '',
      description: '',
      pointsCost: 0,
      category: '',
      imageUrl: ''
    };
  }
  
  async addReward(): Promise<void> {
    if (!this.newReward.name?.trim() || !this.newReward.pointsCost) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const reward: Reward = {
        id: Date.now(), // Temporary ID
        name: this.newReward.name,
        description: this.newReward.description || '',
        pointsCost: this.newReward.pointsCost,
        category: this.newReward.category || 'Other',
        imageUrl: this.newReward.imageUrl || '',
        isActive: true
      };
      
      // TODO: Replace with actual API call
      this.rewardsState.setRewards([...this.rewardsState.rewards(), reward]);
      
      this.resetRewardForm();
      this.showAddRewardForm.set(false);
      console.log('Reward added successfully:', reward);
    } catch (error) {
      console.error('Error adding reward:', error);
      alert('Failed to add reward');
    }
  }
  
  // Set Goal functionality
  toggleSetGoalForm(): void {
    this.showSetGoalForm.update(v => !v);
    if (this.showSetGoalForm()) {
      this.userGoal.set(0);
    }
  }
  
  async setGoal(): Promise<void> {
    if (this.userGoal() <= 0) {
      alert('Please enter a valid goal');
      return;
    }
    
    try {
      // TODO: Replace with actual API call to save user goal
      const currentUser = this.authState.currentUser();
      if (currentUser) {
        console.log(`Goal set for ${currentUser.username}: ${this.userGoal()} points`);
        alert(`Goal set successfully! Aim for ${this.userGoal()} points!`);
        this.showSetGoalForm.set(false);
        this.userGoal.set(0);
      }
    } catch (error) {
      console.error('Error setting goal:', error);
      alert('Failed to set goal');
    }
  }
}
