export interface FamilyMember {
  id?: number;
  username: string;
  email: string;
  displayName: string;
  color?: string;
  age?: number;
  isParent?: boolean;
  rewardPoints?: number;
  roles?: string;
  photo?: string;
  dateOfBirth?: string;
  role?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FamilyMemberInput {
  username: string;
  email: string;
  password: string;
  displayName: string;
  color?: string;
  age?: number;
  isParent?: boolean;
  photo?: string;
  dateOfBirth?: string;
  role?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
}

export interface FamilyMemberUpdate {
  displayName?: string;
  email?: string;
  color?: string;
  age?: number;
  photo?: string;
  dateOfBirth?: string;
  role?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
}
