export interface FamilyList {
  id?: number;
  name: string;
  type: string; // 'shopping', 'todo', 'packing', 'wish', 'custom'
  description?: string;
  isShared: boolean;
  createdBy?: number;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListItem {
  id?: number;
  listId: number;
  content: string;
  isChecked: boolean;
  priority?: string; // 'high', 'medium', 'low', 'none'
  orderIndex: number;
  addedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
