export interface Event {
  id?: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
