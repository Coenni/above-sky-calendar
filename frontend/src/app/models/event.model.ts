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
  icon?: string; // Emoji or icon identifier
  createdAt?: Date;
  updatedAt?: Date;
}
