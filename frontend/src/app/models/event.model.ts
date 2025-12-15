export interface Event {
  id?: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  userId?: number;
  category?: string;
  color?: string;
  isAllDay?: boolean;
  recurrencePattern?: string;
  assignedMembers?: string;
  reminderMinutes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
