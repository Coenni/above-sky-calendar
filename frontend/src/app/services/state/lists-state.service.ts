import { Injectable, signal, computed, effect } from '@angular/core';
import { FamilyList, ListItem } from '../../models/list.model';

@Injectable({ providedIn: 'root' })
export class ListsStateService {
  // Private writable signals
  private _lists = signal<FamilyList[]>([]);
  private _items = signal<ListItem[]>([]);
  private _activeListId = signal<number | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _typeFilter = signal<string>('all');
  private _showArchived = signal(false);
  
  // Public readonly signals
  readonly lists = this._lists.asReadonly();
  readonly items = this._items.asReadonly();
  readonly activeListId = this._activeListId.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly typeFilter = this._typeFilter.asReadonly();
  readonly showArchived = this._showArchived.asReadonly();
  
  // Computed signals
  readonly activeLists = computed(() => 
    this._lists().filter(list => !list.isArchived)
  );
  
  readonly archivedLists = computed(() => 
    this._lists().filter(list => list.isArchived)
  );
  
  readonly filteredLists = computed(() => {
    const lists = this._showArchived() ? this._lists() : this.activeLists();
    const filter = this._typeFilter();
    
    if (filter === 'all') return lists;
    return lists.filter(list => list.type === filter);
  });
  
  readonly activeList = computed(() => {
    const activeId = this._activeListId();
    if (!activeId) return null;
    return this._lists().find(list => list.id === activeId) || null;
  });
  
  readonly activeListItems = computed(() => {
    const activeId = this._activeListId();
    if (!activeId) return [];
    
    return this._items()
      .filter(item => item.listId === activeId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  });
  
  readonly checkedItems = computed(() => 
    this.activeListItems().filter(item => item.isChecked)
  );
  
  readonly uncheckedItems = computed(() => 
    this.activeListItems().filter(item => !item.isChecked)
  );
  
  readonly listProgress = computed(() => {
    const items = this.activeListItems();
    if (items.length === 0) return 0;
    const checked = this.checkedItems().length;
    return (checked / items.length) * 100;
  });
  
  readonly listStats = computed(() => ({
    totalLists: this._lists().length,
    activeLists: this.activeLists().length,
    archivedLists: this.archivedLists().length,
    totalItems: this._items().length,
    activeListItemsCount: this.activeListItems().length,
    checkedItemsCount: this.checkedItems().length,
    progress: this.listProgress()
  }));
  
  readonly shoppingLists = computed(() => 
    this.activeLists().filter(list => list.type === 'shopping')
  );
  
  readonly todoLists = computed(() => 
    this.activeLists().filter(list => list.type === 'todo')
  );
  
  constructor() {
    // Persist preferences
    const savedFilter = localStorage.getItem('lists-type-filter');
    if (savedFilter) {
      this._typeFilter.set(savedFilter);
    }
    
    const savedShowArchived = localStorage.getItem('lists-show-archived');
    if (savedShowArchived) {
      this._showArchived.set(savedShowArchived === 'true');
    }
    
    effect(() => {
      const filter = this._typeFilter();
      localStorage.setItem('lists-type-filter', filter);
    });
    
    effect(() => {
      const showArchived = this._showArchived();
      localStorage.setItem('lists-show-archived', String(showArchived));
    });
  }
  
  // Methods to update state
  setLists(lists: FamilyList[]) {
    this._lists.set(lists);
  }
  
  addList(list: FamilyList) {
    this._lists.update(lists => [...lists, list]);
  }
  
  updateList(id: number, updates: Partial<FamilyList>) {
    this._lists.update(lists => 
      lists.map(l => l.id === id ? { ...l, ...updates } : l)
    );
  }
  
  removeList(id: number) {
    this._lists.update(lists => lists.filter(l => l.id !== id));
    // Also remove all items for this list
    this._items.update(items => items.filter(i => i.listId !== id));
  }
  
  archiveList(id: number) {
    this._lists.update(lists => 
      lists.map(l => l.id === id ? { ...l, isArchived: true, archivedAt: new Date() } : l)
    );
  }
  
  unarchiveList(id: number) {
    this._lists.update(lists => 
      lists.map(l => l.id === id ? { ...l, isArchived: false, archivedAt: undefined } : l)
    );
  }
  
  setItems(items: ListItem[]) {
    this._items.set(items);
  }
  
  addItem(item: ListItem) {
    this._items.update(items => [...items, item]);
  }
  
  updateItem(id: number, updates: Partial<ListItem>) {
    this._items.update(items => 
      items.map(i => i.id === id ? { ...i, ...updates } : i)
    );
  }
  
  removeItem(id: number) {
    this._items.update(items => items.filter(i => i.id !== id));
  }
  
  toggleItemChecked(id: number) {
    this._items.update(items => 
      items.map(i => i.id === id ? { ...i, isChecked: !i.isChecked } : i)
    );
  }
  
  setActiveListId(id: number | null) {
    this._activeListId.set(id);
  }
  
  setTypeFilter(filter: string) {
    this._typeFilter.set(filter);
  }
  
  setShowArchived(show: boolean) {
    this._showArchived.set(show);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  getItemsForList(listId: number): ListItem[] {
    return this._items()
      .filter(item => item.listId === listId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
  
  reset() {
    this._lists.set([]);
    this._items.set([]);
    this._activeListId.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._typeFilter.set('all');
    this._showArchived.set(false);
  }
}
