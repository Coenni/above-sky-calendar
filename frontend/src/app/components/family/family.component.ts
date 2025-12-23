import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FamilyMembersStateService } from '../../services/state/family-members-state.service';
import { FamilyMembersApiService } from '../../services/api/family-members-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { FamilyMember, FamilyMemberInput, FamilyMemberUpdate } from '../../models/family-member.model';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {
  // Inject services using inject()
  private familyMembersState = inject(FamilyMembersStateService);
  private familyMembersApi = inject(FamilyMembersApiService);
  protected authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly members = this.familyMembersState.members;
  readonly loading = this.familyMembersState.loading;
  readonly error = this.familyMembersState.error;
  
  // Local component state
  showMemberForm = signal(false);
  showEditModal = signal(false);
  editingMember = signal<FamilyMember | null>(null);
  
  newMember: FamilyMemberInput = this.getEmptyMemberInput();
  
  // Computed properties
  readonly parentMembers = this.familyMembersState.parents;
  readonly childMembers = this.familyMembersState.children;

  async ngOnInit(): Promise<void> {
    await this.loadAllMembers();
  }

  async loadAllMembers(): Promise<void> {
    this.familyMembersState.setLoading(true);
    this.familyMembersState.setError(null);
    try {
      const members = await this.familyMembersApi.getAllMembers();
      this.familyMembersState.setMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
      this.familyMembersState.setError('Failed to load family members');
    } finally {
      this.familyMembersState.setLoading(false);
    }
  }

  toggleMemberForm(): void {
    this.showMemberForm.update(v => !v);
    if (this.showMemberForm()) {
      this.newMember = this.getEmptyMemberInput();
    }
  }

  async createMember(): Promise<void> {
    if (!this.newMember.username || !this.newMember.email || !this.newMember.displayName) {
      alert('Please enter username, email, and display name');
      return;
    }

    try {
      const member = await this.familyMembersApi.createMember(this.newMember);
      this.familyMembersState.addMember(member);
      this.toggleMemberForm();
    } catch (error) {
      console.error('Error creating family member:', error);
      alert('Failed to create family member');
    }
  }

  async deleteMember(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this family member?')) {
      return;
    }

    try {
      await this.familyMembersApi.deleteMember(id);
      this.familyMembersState.removeMember(id);
    } catch (error) {
      console.error('Error deleting family member:', error);
      alert('Failed to delete family member');
    }
  }

  editMember(member: FamilyMember): void {
    this.editingMember.set(member);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingMember.set(null);
  }

  async saveEditedMember(): Promise<void> {
    const member = this.editingMember();
    if (!member || !member.id) return;

    const update: FamilyMemberUpdate = {
      displayName: member.displayName,
      email: member.email,
      color: member.color,
      age: member.age,
      photo: member.photo,
      dateOfBirth: member.dateOfBirth,
      role: member.role,
      phone: member.phone,
      gender: member.gender
    };

    try {
      const updated = await this.familyMembersApi.updateMember(member.id, update);
      this.familyMembersState.updateMember(member.id, updated);
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating family member:', error);
      alert('Failed to update family member');
    }
  }

  getRoleIcon(role?: string): string {
    const icons: Record<string, string> = {
      'Parent': '👨',
      'Child': '👶',
      'Teen': '👦',
      'Adult': '👤'
    };
    return icons[role || ''] || '👤';
  }

  getDefaultAvatar(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  private getEmptyMemberInput(): FamilyMemberInput {
    return {
      username: '',
      email: '',
      password: '',
      displayName: '',
      isParent: false
    };
  }
}
