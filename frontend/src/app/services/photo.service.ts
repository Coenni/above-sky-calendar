import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../models/photo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}

  getAllPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.apiUrl);
  }

  getPhotosByUser(userId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPhotosByEvent(eventId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/event/${eventId}`);
  }

  getPhotoById(id: number): Observable<Photo> {
    return this.http.get<Photo>(`${this.apiUrl}/${id}`);
  }

  createPhoto(photo: Photo): Observable<Photo> {
    return this.http.post<Photo>(this.apiUrl, photo);
  }

  updatePhoto(id: number, photo: Photo): Observable<Photo> {
    return this.http.put<Photo>(`${this.apiUrl}/${id}`, photo);
  }

  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
