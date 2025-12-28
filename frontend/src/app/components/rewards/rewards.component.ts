import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RewardsStateService } from '../../services/state/rewards-state.service';
import { RewardsApiService } from '../../services/api/rewards-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { ModeService } from '../../services/mode.service';
import { Reward } from '../../models/reward.model';
import { Goal } from '../../models/goal.model';

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
  showAddRewardModal = signal(false);
  showEditRewardModal = signal(false);
  showSetGoalModal = signal(false);
  editingReward = signal<Reward | null>(null);
  
  // Mock family members (in real app, would come from a service)
  familyMembers = signal([
    { id: 1, username: 'Mom', color: '#A8B5A0' },
    { id: 2, username: 'Dad', color: '#D4906C' },
    { id: 3, username: 'Emma', color: '#B8D4C1' },
    { id: 4, username: 'Noah', color: '#F4C7AB' }
  ]);
  
  // Goals
  goals = signal<Goal[]>([]);
  
  newReward = signal<Partial<Reward>>({
    name: '',
    description: '',
    pointsCost: 0,
    category: '',
    imageUrl: ''
  });
  
  newGoal = signal<Partial<Goal>>({
    userId: -1,
    rewardId: -1,
    targetPoints: 0,
    period: 'week',
    currentPoints: 0,
    isActive: true
  });
  
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

  // Computed signal for active goals
  readonly activeGoals = computed(() => {
    return this.goals().filter(g => g.isActive);
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
  toggleAddRewardModal(): void {
    this.showAddRewardModal.update(v => !v);
    if (this.showAddRewardModal()) {
      this.resetRewardForm();
    }
  }
  
  openEditRewardModal(reward: Reward): void {
    this.editingReward.set(reward);
    this.newReward.set({ ...reward });
    this.showEditRewardModal.set(true);
  }
  
  closeRewardModal(): void {
    this.showAddRewardModal.set(false);
    this.showEditRewardModal.set(false);
    this.editingReward.set(null);
    this.resetRewardForm();
  }
  
  resetRewardForm(): void {
    this.newReward.set({
      name: '',
      description: '',
      pointsCost: 0,
      category: '',
      imageUrl: ''
    });
  }
  
  async saveReward(): Promise<void> {
    const reward = this.newReward();
    if (!reward.name?.trim() || !reward.pointsCost) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const editingReward = this.editingReward();
      
      if (editingReward && editingReward.id) {
        // Update existing reward
        const updatedReward: Reward = {
          ...editingReward,
          name: reward.name,
          description: reward.description || '',
          pointsCost: reward.pointsCost,
          category: reward.category || 'Other',
          imageUrl: reward.imageUrl || ''
        };
        
        const rewards = this.rewardsState.rewards();
        const index = rewards.findIndex(r => r.id === editingReward.id);
        if (index !== -1) {
          rewards[index] = updatedReward;
          this.rewardsState.setRewards([...rewards]);
        }
      } else {
        // Create new reward
        const newRewardObj: Reward = {
          id: Date.now(), // Temporary ID
          name: reward.name,
          description: reward.description || '',
          pointsCost: reward.pointsCost,
          category: reward.category || 'Other',
          imageUrl: reward.imageUrl || '',
          isActive: true
        };
        
        this.rewardsState.setRewards([...this.rewardsState.rewards(), newRewardObj]);
      }
      
      this.closeRewardModal();
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Failed to save reward');
    }
  }
  
  async deleteReward(reward: Reward): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${reward.name}"?`)) {
      return;
    }
    
    try {
      const rewards = this.rewardsState.rewards().filter(r => r.id !== reward.id);
      this.rewardsState.setRewards(rewards);
      this.closeRewardModal();
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Failed to delete reward');
    }
  }
  
  // Set Goal functionality
  toggleSetGoalModal(): void {
    this.showSetGoalModal.update(v => !v);
    if (this.showSetGoalModal()) {
      this.resetGoalForm();
    }
  }
  
  resetGoalForm(): void {
    this.newGoal.set({
      userId: -1,
      rewardId: -1,
      targetPoints: 0,
      period: 'week',
      currentPoints: 0,
      isActive: true
    });
  }
  
  // Helper methods for form binding
  updateRewardName(value: string): void {
    this.newReward.update(r => ({ ...r, name: value }));
  }
  
  updateRewardDescription(value: string): void {
    this.newReward.update(r => ({ ...r, description: value }));
  }
  
  updateRewardPoints(value: string | number): void {
    const points = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(points)) {
      this.newReward.update(r => ({ ...r, pointsCost: points }));
    }
  }
  
  updateRewardCategory(value: string): void {
    this.newReward.update(r => ({ ...r, category: value }));
  }
  
  updateRewardImageUrl(value: string): void {
    this.newReward.update(r => ({ ...r, imageUrl: value }));
  }
  
  updateGoalUserId(value: string | number): void {
    const userId = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(userId)) {
      this.newGoal.update(g => ({ ...g, userId }));
    }
  }
  
  updateGoalPeriod(value: string): void {
    this.newGoal.update(g => ({ ...g, period: value as 'day' | 'week' | 'month' }));
  }
  
  updateGoalRewardId(value: string | number): void {
    const rewardId = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(rewardId)) {
      this.newGoal.update(g => ({ ...g, rewardId }));
    }
  }
  
  async saveGoal(): Promise<void> {
    const goalData = this.newGoal();
    if (!goalData.userId || goalData.userId <= 0 || !goalData.rewardId || goalData.rewardId <= 0) {
      alert('Please select an assignee and a reward');
      return;
    }
    
    try {
      const reward = this.rewards().find(r => r.id === goalData.rewardId);
      const member = this.familyMembers().find(m => m.id === goalData.userId);
      
      const goal: Goal = {
        id: Date.now(),
        userId: goalData.userId!,
        userName: member?.username,
        rewardId: goalData.rewardId!,
        rewardName: reward?.name,
        targetPoints: reward?.pointsCost || 0,
        period: goalData.period!,
        currentPoints: 0,
        isActive: true,
        createdAt: new Date()
      };
      
      this.goals.update(goals => [...goals, goal]);
      this.showSetGoalModal.set(false);
      this.resetGoalForm();
    } catch (error) {
      console.error('Error setting goal:', error);
      alert('Failed to set goal');
    }
  }
  
  getGoalProgress(goal: Goal): number {
    if (goal.targetPoints === 0) return 0;
    return Math.min(100, (goal.currentPoints / goal.targetPoints) * 100);
  }
  
  canClaimGoal(goal: Goal): boolean {
    return goal.isActive && goal.currentPoints >= goal.targetPoints;
  }
  
  async claimGoal(goal: Goal): Promise<void> {
    if (!this.canClaimGoal(goal)) {
      alert('Not enough points to claim this goal');
      return;
    }
    
    if (!confirm('Claim this reward?')) {
      return;
    }
    
    try {
      // Mark goal as completed
      this.goals.update(goals => 
        goals.map(g => g.id === goal.id ? { ...g, isActive: false, completedAt: new Date() } : g)
      );
      
      alert('Goal claimed successfully!');
    } catch (error) {
      console.error('Error claiming goal:', error);
      alert('Failed to claim goal');
    }
  }
  
  deleteGoal(goal: Goal): void {
    if (!confirm('Delete this goal?')) {
      return;
    }
    
    this.goals.update(goals => goals.filter(g => g.id !== goal.id));
  }

  // Helper method to get family member color
  getFamilyMemberColor(userId: number | undefined): string {
    if (!userId) return '#9ca3af';
    const member = this.familyMembers().find(m => m.id === userId);
    return member?.color || '#9ca3af';
  }
}
