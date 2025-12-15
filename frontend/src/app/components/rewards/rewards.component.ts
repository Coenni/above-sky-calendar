import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RewardService } from '../../services/reward.service';
import { AuthService } from '../../services/auth.service';
import { Reward, RewardRedemption } from '../../models/reward.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {
  rewards: Reward[] = [];
  filteredRewards: Reward[] = [];
  currentUser: User | null = null;
  userPoints: number = 0;
  isLoading = false;
  showRedeemModal = false;
  selectedReward: Reward | null = null;
  redemptionNotes = '';
  filterCategory = 'all';
  searchQuery = '';
  showHistory = false;
  redemptionHistory: RewardRedemption[] = [];

  constructor(
    private rewardService: RewardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadRewards();
      this.loadUserPoints();
    }
  }

  loadRewards(): void {
    this.isLoading = true;
    this.rewardService.getAllRewards().subscribe({
      next: (rewards) => {
        this.rewards = rewards.filter(r => r.isActive);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rewards:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserPoints(): void {
    if (this.currentUser?.id) {
      // For now, use the points from the user object
      // In production, this would fetch from the API
      this.userPoints = this.currentUser.rewardPoints || 0;
    }
  }

  loadRedemptionHistory(): void {
    if (this.currentUser?.id) {
      this.rewardService.getUserRedemptions(this.currentUser.id).subscribe({
        next: (history) => {
          this.redemptionHistory = history;
        },
        error: (error) => {
          console.error('Error loading redemption history:', error);
        }
      });
    }
  }

  applyFilters(): void {
    let filtered = this.rewards;

    // Apply category filter
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(r => r.category === this.filterCategory);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) || 
        r.description.toLowerCase().includes(query)
      );
    }

    this.filteredRewards = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  canAfford(reward: Reward): boolean {
    return this.userPoints >= reward.pointsCost;
  }

  openRedeemModal(reward: Reward): void {
    if (!this.canAfford(reward)) {
      alert(`You need ${reward.pointsCost - this.userPoints} more points to redeem this reward.`);
      return;
    }
    this.selectedReward = reward;
    this.redemptionNotes = '';
    this.showRedeemModal = true;
  }

  closeRedeemModal(): void {
    this.showRedeemModal = false;
    this.selectedReward = null;
    this.redemptionNotes = '';
  }

  confirmRedemption(): void {
    if (!this.selectedReward || !this.currentUser?.id) return;

    this.rewardService.redeemReward(
      this.currentUser.id, 
      this.selectedReward.id!, 
      this.redemptionNotes
    ).subscribe({
      next: (redemption) => {
        alert('Reward redeemed successfully! Your redemption is pending approval.');
        this.userPoints -= this.selectedReward!.pointsCost;
        this.closeRedeemModal();
        this.loadRedemptionHistory();
      },
      error: (error) => {
        console.error('Error redeeming reward:', error);
        alert('Failed to redeem reward. Please try again.');
      }
    });
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.redemptionHistory.length === 0) {
      this.loadRedemptionHistory();
    }
  }

  getUniqueCategories(): string[] {
    const categories = new Set(this.rewards.map(r => r.category).filter(c => c));
    return Array.from(categories) as string[];
  }
}
