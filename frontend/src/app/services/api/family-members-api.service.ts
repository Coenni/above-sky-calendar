import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FamilyMembersService } from '../family-members.service';
import { FamilyMember, FamilyMemberInput, FamilyMemberUpdate } from '../../models/family-member.model';

@Injectable({ providedIn: 'root' })
export class FamilyMembersApiService {
  constructor(private familyMembersService: FamilyMembersService) {}
  
  async getAllMembers(): Promise<FamilyMember[]> {
    return firstValueFrom(this.familyMembersService.getAllMembers());
  }
  
  async getMemberById(id: number): Promise<FamilyMember> {
    return firstValueFrom(this.familyMembersService.getMemberById(id));
  }
  
  async createMember(member: FamilyMemberInput): Promise<FamilyMember> {
    return firstValueFrom(this.familyMembersService.createMember(member));
  }
  
  async updateMember(id: number, member: FamilyMemberUpdate): Promise<FamilyMember> {
    return firstValueFrom(this.familyMembersService.updateMember(id, member));
  }
  
  async deleteMember(id: number): Promise<void> {
    return firstValueFrom(this.familyMembersService.deleteMember(id));
  }
}
