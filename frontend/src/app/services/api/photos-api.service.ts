import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PhotoService } from '../photo.service';
import { Photo } from '../../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotosApiService {
  constructor(private photoService: PhotoService) {}
  
  async getAllPhotos(): Promise<Photo[]> {
    return firstValueFrom(this.photoService.getAllPhotos());
  }
  
  async getPhotosByUser(userId: number): Promise<Photo[]> {
    return firstValueFrom(this.photoService.getPhotosByUser(userId));
  }
  
  async getPhotosByEvent(eventId: number): Promise<Photo[]> {
    return firstValueFrom(this.photoService.getPhotosByEvent(eventId));
  }
  
  async getPhotoById(id: number): Promise<Photo> {
    return firstValueFrom(this.photoService.getPhotoById(id));
  }
  
  async createPhoto(photo: Photo): Promise<Photo> {
    return firstValueFrom(this.photoService.createPhoto(photo));
  }
  
  async updatePhoto(id: number, photo: Photo): Promise<Photo> {
    return firstValueFrom(this.photoService.updatePhoto(id, photo));
  }
  
  async deletePhoto(id: number): Promise<void> {
    return firstValueFrom(this.photoService.deletePhoto(id));
  }
}
