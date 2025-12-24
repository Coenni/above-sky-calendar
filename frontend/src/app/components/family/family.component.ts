import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../services/state/auth-state.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {
  protected authState = inject(AuthStateService);
  
  familyMembers = signal<User[]>([]);
  loading = signal(false);
  showAddForm = signal(false);
  
  newMember: Partial<User> = {
    username: '',
    email: '',
    isParent: false,
    color: '#A8B5A0',
    rewardPoints: 0
  };
  
  ngOnInit(): void {
    this.loadFamilyMembers();
  }
  
  async loadFamilyMembers(): Promise<void> {
    this.loading.set(true);
    try {
      // TODO: Implement API call to fetch family members
      // For now, just show the current user
      const currentUser = this.authState.currentUser();
      if (currentUser) {
        this.familyMembers.set([currentUser]);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      this.loading.set(false);
    }
  }
  
  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    if (!this.showAddForm()) {
      this.resetForm();
    }
  }
  
  resetForm(): void {
    this.newMember = {
      username: '',
      email: '',
      isParent: false,
      color: '#A8B5A0',
      rewardPoints: 0
    };
  }
  
  async addMember(): Promise<void> {
    if (!this.newMember.username?.trim() || !this.newMember.email?.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // TODO: Replace with actual API call
      const newUser: User = {
        id: Date.now(), // Temporary ID generation
        username: this.newMember.username,
        email: this.newMember.email,
        isParent: this.newMember.isParent || false,
        color: this.newMember.color || '#A8B5A0',
        rewardPoints: this.newMember.rewardPoints || 0
      };
      
      this.familyMembers.update(members => [...members, newUser]);
      this.resetForm();
      this.showAddForm.set(false);
      
      // Show success message
      console.log('Member added successfully:', newUser);
    } catch (error) {
      console.error('Error adding family member:', error);
      alert('Failed to add family member');
    }
  }
  
  getMemberColor(color?: string): string {
    return color || '#A8B5A0';
  }
}
