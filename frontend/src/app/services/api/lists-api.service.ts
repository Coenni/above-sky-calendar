import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ListService } from '../list.service';
import { FamilyList, ListItem } from '../../models/list.model';

@Injectable({ providedIn: 'root' })
export class ListsApiService {
  constructor(private listService: ListService) {}
  
  // List methods
  async getAllLists(): Promise<FamilyList[]> {
    return firstValueFrom(this.listService.getAllLists());
  }
  
  async getSharedLists(): Promise<FamilyList[]> {
    return firstValueFrom(this.listService.getSharedLists());
  }
  
  async getListById(id: number): Promise<FamilyList> {
    return firstValueFrom(this.listService.getListById(id));
  }
  
  async createList(list: FamilyList): Promise<FamilyList> {
    return firstValueFrom(this.listService.createList(list));
  }
  
  async updateList(id: number, list: FamilyList): Promise<FamilyList> {
    return firstValueFrom(this.listService.updateList(id, list));
  }
  
  async archiveList(id: number): Promise<void> {
    return firstValueFrom(this.listService.archiveList(id));
  }
  
  async deleteList(id: number): Promise<void> {
    return firstValueFrom(this.listService.deleteList(id));
  }
  
  // List item methods
  async getListItems(listId: number): Promise<ListItem[]> {
    return firstValueFrom(this.listService.getListItems(listId));
  }
  
  async createListItem(item: ListItem): Promise<ListItem> {
    return firstValueFrom(this.listService.createListItem(item));
  }
  
  async updateListItem(id: number, item: ListItem): Promise<ListItem> {
    return firstValueFrom(this.listService.updateListItem(id, item));
  }
  
  async deleteListItem(id: number): Promise<void> {
    return firstValueFrom(this.listService.deleteListItem(id));
  }
}
