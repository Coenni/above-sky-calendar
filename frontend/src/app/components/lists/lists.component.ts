import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListsStateService } from '../../services/state/lists-state.service';
import { ListsApiService } from '../../services/api/lists-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { FamilyList, ListItem } from '../../models/list.model';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  // Inject services using inject()
  private listsState = inject(ListsStateService);
  private listsApi = inject(ListsApiService);
  protected authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly lists = this.listsState.filteredLists;
  readonly activeList = this.listsState.activeList;
  readonly activeListItems = this.listsState.activeListItems;
  readonly loading = this.listsState.loading;
  readonly error = this.listsState.error;
  readonly listProgress = this.listsState.listProgress;
  readonly listStats = this.listsState.listStats;
  
  // Local component state
  showListForm = signal(false);
  newItemName = signal('');
  
  newList: FamilyList = {
    name: '',
    type: 'todo',
    isShared: false,
    isArchived: false
  };

  async ngOnInit(): Promise<void> {
    await this.loadLists();
  }

  async loadLists(): Promise<void> {
    this.listsState.setLoading(true);
    this.listsState.setError(null);
    try {
      const lists = await this.listsApi.getAllLists();
      this.listsState.setLists(lists);
      
      // Load items for all lists
      const allItems: ListItem[] = [];
      for (const list of lists) {
        if (list.id) {
          const items = await this.listsApi.getListItems(list.id);
          allItems.push(...items);
        }
      }
      this.listsState.setItems(allItems);
    } catch (error) {
      console.error('Error loading lists:', error);
      this.listsState.setError('Failed to load lists');
    } finally {
      this.listsState.setLoading(false);
    }
  }

  toggleListForm(): void {
    this.showListForm.update(v => !v);
    if (this.showListForm()) {
      const currentUser = this.authState.currentUser();
      this.newList = {
        name: '',
        type: 'todo',
        isShared: false,
        isArchived: false,
        createdBy: currentUser?.id
      };
    }
  }

  async createList(): Promise<void> {
    if (!this.newList.name) {
      alert('Please enter a list name');
      return;
    }

    try {
      const list = await this.listsApi.createList(this.newList);
      this.listsState.addList(list);
      this.toggleListForm();
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    }
  }

  async selectList(list: FamilyList): Promise<void> {
    this.listsState.setActiveListId(list.id || null);
    if (list.id) {
      await this.loadListItems(list.id);
    }
  }

  closeListDetail(): void {
    this.listsState.setActiveListId(null);
  }

  async loadListItems(listId: number): Promise<void> {
    try {
      const items = await this.listsApi.getListItems(listId);
      // Update items in state for this list
      const currentItems = this.listsState.items();
      const otherItems = currentItems.filter(i => i.listId !== listId);
      this.listsState.setItems([...otherItems, ...items]);
    } catch (error) {
      console.error('Error loading list items:', error);
    }
  }

  async addItem(): Promise<void> {
    const itemName = this.newItemName().trim();
    const activeList = this.activeList();
    
    if (!itemName || !activeList?.id) {
      return;
    }

    const items = this.activeListItems();
    const newItem: ListItem = {
      listId: activeList.id,
      content: itemName,
      isChecked: false,
      orderIndex: items.length
    };

    try {
      const item = await this.listsApi.createListItem(newItem);
      this.listsState.addItem(item);
      this.newItemName.set('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  }

  async toggleItem(item: ListItem): Promise<void> {
    if (!item.id) return;

    try {
      const updatedItem = { ...item, isChecked: !item.isChecked };
      const updated = await this.listsApi.updateListItem(item.id, updatedItem);
      this.listsState.updateItem(item.id, updated);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }

  async deleteItem(id: number | undefined): Promise<void> {
    if (!id) return;

    try {
      await this.listsApi.deleteListItem(id);
      this.listsState.removeItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async deleteList(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this list?')) {
      return;
    }

    try {
      await this.listsApi.deleteList(id);
      this.listsState.removeList(id);
      if (this.activeList()?.id === id) {
        this.closeListDetail();
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list');
    }
  }

  getCompletedCount(listId: number): number {
    const items = this.listsState.getItemsForList(listId);
    return items.filter(i => i.isChecked).length;
  }

  getTotalCount(listId: number): number {
    return this.listsState.getItemsForList(listId).length;
  }

  getProgressPercentage(listId: number): number {
    const total = this.getTotalCount(listId);
    if (total === 0) return 0;
    const completed = this.getCompletedCount(listId);
    return Math.round((completed / total) * 100);
  }
}
