import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListService } from '../../services/list.service';
import { AuthService } from '../../services/auth.service';
import { FamilyList, ListItem } from '../../models/list.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  lists: FamilyList[] = [];
  currentUser: User | null = null;
  isLoading = false;
  showListForm = false;
  selectedList: FamilyList | null = null;
  listItems: ListItem[] = [];
  newItemName = '';
  
  newList: FamilyList = {
    name: '',
    type: 'todo',
    isShared: false,
    isArchived: false
  };

  constructor(
    private listService: ListService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.listService.getAllLists().subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading lists:', error);
        this.isLoading = false;
      }
    });
  }

  toggleListForm(): void {
    this.showListForm = !this.showListForm;
    if (this.showListForm) {
      this.newList = {
        name: '',
        type: 'todo',
        isShared: false,
        isArchived: false,
        createdBy: this.currentUser?.id
      };
    }
  }

  createList(): void {
    if (!this.newList.name) {
      alert('Please enter a list name');
      return;
    }

    this.listService.createList(this.newList).subscribe({
      next: (list) => {
        this.lists.push(list);
        this.toggleListForm();
      },
      error: (error) => {
        console.error('Error creating list:', error);
        alert('Failed to create list');
      }
    });
  }

  selectList(list: FamilyList): void {
    this.selectedList = list;
    this.loadListItems(list.id!);
  }

  closeListDetail(): void {
    this.selectedList = null;
    this.listItems = [];
  }

  loadListItems(listId: number): void {
    this.listService.getListItems(listId).subscribe({
      next: (items) => {
        this.listItems = items;
      },
      error: (error) => {
        console.error('Error loading list items:', error);
      }
    });
  }

  addItem(): void {
    if (!this.newItemName.trim() || !this.selectedList?.id) {
      return;
    }

    const newItem: ListItem = {
      listId: this.selectedList.id,
      content: this.newItemName,
      isChecked: false,
      orderIndex: this.listItems.length
    };

    this.listService.createListItem(newItem).subscribe({
      next: (item) => {
        this.listItems.push(item);
        this.newItemName = '';
      },
      error: (error) => {
        console.error('Error adding item:', error);
        alert('Failed to add item');
      }
    });
  }

  toggleItem(item: ListItem): void {
    if (!item.id) return;

    const updatedItem = { ...item, isChecked: !item.isChecked };
    this.listService.updateListItem(item.id, updatedItem).subscribe({
      next: (updated) => {
        const index = this.listItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          this.listItems[index] = updated;
        }
      },
      error: (error) => {
        console.error('Error updating item:', error);
      }
    });
  }

  deleteItem(id: number | undefined): void {
    if (!id) return;

    this.listService.deleteListItem(id).subscribe({
      next: () => {
        this.listItems = this.listItems.filter(i => i.id !== id);
      },
      error: (error) => {
        console.error('Error deleting item:', error);
      }
    });
  }

  deleteList(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this list?')) {
      return;
    }

    this.listService.deleteList(id).subscribe({
      next: () => {
        this.lists = this.lists.filter(l => l.id !== id);
        if (this.selectedList?.id === id) {
          this.closeListDetail();
        }
      },
      error: (error) => {
        console.error('Error deleting list:', error);
        alert('Failed to delete list');
      }
    });
  }

  getCompletedCount(listId: number): number {
    // This would ideally come from the API
    return 0;
  }

  getTotalCount(listId: number): number {
    // This would ideally come from the API
    return 0;
  }

  getProgressPercentage(listId: number): number {
    const total = this.getTotalCount(listId);
    if (total === 0) return 0;
    const completed = this.getCompletedCount(listId);
    return Math.round((completed / total) * 100);
  }
}
