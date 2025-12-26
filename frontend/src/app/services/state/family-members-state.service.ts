import { Injectable, signal, computed } from '@angular/core';
import { FamilyMember } from '../../models/family-member.model';

@Injectable({ providedIn: 'root' })
export class FamilyMembersStateService {
  // Private writable signals
  private _members = signal<FamilyMember[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  
  // Public readonly signals
  readonly members = this._members.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed signals
  readonly parents = computed(() => 
    this._members().filter(m => m.isParent)
  );
  
  readonly children = computed(() => 
    this._members().filter(m => !m.isParent)
  );
  
  readonly memberStats = computed(() => ({
    totalMembers: this._members().length,
    parentsCount: this.parents().length,
    childrenCount: this.children().length
  }));
  
  // Methods to update state
  setMembers(members: FamilyMember[]) {
    this._members.set(members);
  }
  
  addMember(member: FamilyMember) {
    this._members.update(members => [...members, member]);
  }
  
  updateMember(id: number, updates: Partial<FamilyMember>) {
    this._members.update(members => 
      members.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  }
  
  removeMember(id: number) {
    this._members.update(members => members.filter(m => m.id !== id));
  }
  
  getMemberById(id: number): FamilyMember | undefined {
    return this._members().find(m => m.id === id);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  reset() {
    this._members.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
