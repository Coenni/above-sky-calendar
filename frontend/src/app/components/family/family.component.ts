import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FamilyMembersStateService } from '../../services/state/family-members-state.service';
import { FamilyMembersApiService } from '../../services/api/family-members-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { ModeService } from '../../services/mode.service';
import { ModeSwitchRequest } from '../../models/mode.model';
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
  private modeService = inject(ModeService);
  
  // Expose signals to template
  readonly members = this.familyMembersState.members;
  readonly loading = this.familyMembersState.loading;
  readonly error = this.familyMembersState.error;
  
  // Local component state
  showMemberForm = signal(false);
  showEditModal = signal(false);
  editingMember = signal<FamilyMember | null>(null);
  
  // Parent mode PIN entry
  showPinModal = signal(false);
  pin = signal('');
  pinError = signal<string | null>(null);
  pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);
  pendingDeleteId = signal<number | undefined>(undefined);
  
  newMember: FamilyMemberInput = this.getEmptyMemberInput();
  
  // Computed properties
  readonly parentMembers = this.familyMembersState.parents;
  readonly childMembers = this.familyMembersState.children;
  readonly isParentMode = computed(() => this.modeService.isParentMode());
  readonly hasPinSet = computed(() => this.modeService.hasPinSet());

  async ngOnInit(): Promise<void> {
    // Load current mode status
    this.modeService.getCurrentMode(false).subscribe({
      next: () => {}, // Mode is cached in the service
      error: (err) => console.error('Error loading mode:', err)
    });
    
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

    // Check if in parent mode before creating
    if (!this.isParentMode()) {
      this.pendingAction.set('create');
      this.requestParentMode();
      return;
    }

    await this.executeCreateMember();
  }

  private async executeCreateMember(): Promise<void> {
    try {
      const member = await this.familyMembersApi.createMember(this.newMember);
      this.familyMembersState.addMember(member);
      this.toggleMemberForm();
      this.pendingAction.set(null);
    } catch (error) {
      console.error('Error creating family member:', error);
      alert('Failed to create family member. Make sure you are in parent mode.');
    }
  }

  async deleteMember(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this family member?')) {
      return;
    }

    // Check if in parent mode before deleting
    if (!this.isParentMode()) {
      this.pendingAction.set('delete');
      this.pendingDeleteId.set(id);
      this.requestParentMode();
      return;
    }

    await this.executeDeleteMember(id);
  }

  private async executeDeleteMember(id: number): Promise<void> {
    try {
      await this.familyMembersApi.deleteMember(id);
      this.familyMembersState.removeMember(id);
      this.pendingAction.set(null);
      this.pendingDeleteId.set(undefined);
    } catch (error) {
      console.error('Error deleting family member:', error);
      alert('Failed to delete family member. Make sure you are in parent mode.');
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

    // Check if in parent mode before updating
    if (!this.isParentMode()) {
      this.pendingAction.set('edit');
      this.requestParentMode();
      return;
    }

    await this.executeSaveEditedMember();
  }

  private async executeSaveEditedMember(): Promise<void> {
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
      this.pendingAction.set(null);
    } catch (error) {
      console.error('Error updating family member:', error);
      alert('Failed to update family member. Make sure you are in parent mode.');
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

  // Parent mode activation methods
  private requestParentMode(): void {
    if (!this.hasPinSet()) {
      alert('Please set up a PIN in Settings first before managing family members.');
      return;
    }
    this.showPinModal.set(true);
    this.pin.set('');
    this.pinError.set(null);
  }

  submitPin(): void {
    const enteredPin = this.pin();
    if (enteredPin.length !== 4) {
      this.pinError.set('PIN must be 4 digits');
      return;
    }

    const request: ModeSwitchRequest = {
      targetMode: 'PARENT',
      pin: enteredPin
    };

    this.modeService.switchMode(request).subscribe({
      next: () => {
        this.closePinModal();
        // Execute the pending action after successfully activating parent mode
        this.executePendingAction();
      },
      error: (err) => {
        console.error('Failed to activate parent mode', err);
        this.pinError.set('Invalid PIN. Please try again.');
      }
    });
  }

  private async executePendingAction(): Promise<void> {
    const action = this.pendingAction();
    
    switch (action) {
      case 'create':
        await this.executeCreateMember();
        break;
      case 'edit':
        await this.executeSaveEditedMember();
        break;
      case 'delete':
        const deleteId = this.pendingDeleteId();
        if (deleteId) {
          await this.executeDeleteMember(deleteId);
        }
        break;
    }
  }

  closePinModal(): void {
    this.showPinModal.set(false);
    this.pin.set('');
    this.pinError.set(null);
  }

  cancelPinEntry(): void {
    this.closePinModal();
    this.pendingAction.set(null);
    this.pendingDeleteId.set(undefined);
  }
}
