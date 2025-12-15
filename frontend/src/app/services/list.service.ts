import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FamilyList, ListItem } from '../models/list.model';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = '/api/lists';

  constructor(private http: HttpClient) {}

  // List methods
  getAllLists(): Observable<FamilyList[]> {
    return this.http.get<FamilyList[]>(this.apiUrl);
  }

  getSharedLists(): Observable<FamilyList[]> {
    return this.http.get<FamilyList[]>(`${this.apiUrl}/shared`);
  }

  getListById(id: number): Observable<FamilyList> {
    return this.http.get<FamilyList>(`${this.apiUrl}/${id}`);
  }

  createList(list: FamilyList): Observable<FamilyList> {
    return this.http.post<FamilyList>(this.apiUrl, list);
  }

  updateList(id: number, list: FamilyList): Observable<FamilyList> {
    return this.http.put<FamilyList>(`${this.apiUrl}/${id}`, list);
  }

  archiveList(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/archive`, {});
  }

  deleteList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // List item methods
  getListItems(listId: number): Observable<ListItem[]> {
    return this.http.get<ListItem[]>(`${this.apiUrl}/${listId}/items`);
  }

  createListItem(item: ListItem): Observable<ListItem> {
    return this.http.post<ListItem>(`${this.apiUrl}/items`, item);
  }

  updateListItem(id: number, item: ListItem): Observable<ListItem> {
    return this.http.put<ListItem>(`${this.apiUrl}/items/${id}`, item);
  }

  deleteListItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }
}
