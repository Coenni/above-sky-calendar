export interface User {
  id: number;
  username: string;
  email: string;
  roles?: string;
  displayName?: string;
  color?: string;
  age?: number;
  isParent?: boolean;
  rewardPoints?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
