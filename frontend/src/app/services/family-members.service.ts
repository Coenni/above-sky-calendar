import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FamilyMember, FamilyMemberInput, FamilyMemberUpdate } from '../models/family-member.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FamilyMembersService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  getAllMembers(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(this.apiUrl);
  }

  getMemberById(id: number): Observable<FamilyMember> {
    return this.http.get<FamilyMember>(`${this.apiUrl}/${id}`);
  }

  createMember(member: FamilyMemberInput): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(this.apiUrl, member);
  }

  updateMember(id: number, member: FamilyMemberUpdate): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(`${this.apiUrl}/${id}`, member);
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
