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
  }
  
  getMemberColor(color?: string): string {
    return color || '#A8B5A0';
  }
}
