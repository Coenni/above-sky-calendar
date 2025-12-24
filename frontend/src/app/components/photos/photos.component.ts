import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PhotosStateService } from '../../services/state/photos-state.service';
import { PhotosApiService } from '../../services/api/photos-api.service';
import { AuthStateService } from '../../services/state/auth-state.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit {
  // Inject services using inject()
  private photosState = inject(PhotosStateService);
  private photosApi = inject(PhotosApiService);
  protected authState = inject(AuthStateService);
  
  // Expose signals to template
  readonly photos = this.photosState.sortedPhotos;
  readonly loading = this.photosState.loading;
  readonly error = this.photosState.error;
  readonly selectedPhoto = this.photosState.selectedPhoto;
  readonly tagFilter = this.photosState.tagFilter;
  readonly allTags = this.photosState.allTags;
  
  // Local component state
  showLightbox = signal(false);
  currentPhotoIndex = signal(0);
  showUploadForm = signal(false);
  
  newPhoto: Photo = {
    fileName: '',
    filePath: '',
    caption: '',
    uploadedBy: 0
  };

  async ngOnInit(): Promise<void> {
    await this.loadPhotos();
  }

  async loadPhotos(): Promise<void> {
    this.photosState.setLoading(true);
    this.photosState.setError(null);
    try {
      const photos = await this.photosApi.getAllPhotos();
      this.photosState.setPhotos(photos);
    } catch (error) {
      console.error('Error loading photos:', error);
      this.photosState.setError('Failed to load photos');
    } finally {
      this.photosState.setLoading(false);
    }
  }

  toggleUploadForm(): void {
    this.showUploadForm.update(v => !v);
    if (this.showUploadForm()) {
      const currentUser = this.authState.currentUser();
      this.newPhoto = {
        fileName: '',
        filePath: '',
        caption: '',
        uploadedBy: currentUser?.id || 0
      };
    }
  }

  async uploadPhoto(): Promise<void> {
    if (!this.newPhoto.filePath) {
      alert('Please provide an image URL');
      return;
    }

    // Set fileName from filePath if not provided
    if (!this.newPhoto.fileName) {
      this.newPhoto.fileName = this.newPhoto.filePath.split('/').pop() || 'photo.jpg';
    }

    try {
      const photo = await this.photosApi.createPhoto(this.newPhoto);
      this.photosState.addPhoto(photo);
      this.toggleUploadForm();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    }
  }

  openLightbox(index: number): void {
    this.currentPhotoIndex.set(index);
    const photo = this.photos()[index];
    if (photo) {
      this.photosState.setSelectedPhoto(photo);
      this.showLightbox.set(true);
    }
  }

  closeLightbox(): void {
    this.showLightbox.set(false);
    this.photosState.setSelectedPhoto(null);
  }

  previousPhoto(): void {
    const current = this.currentPhotoIndex();
    if (current > 0) {
      this.currentPhotoIndex.set(current - 1);
      const photo = this.photos()[current - 1];
      if (photo) {
        this.photosState.setSelectedPhoto(photo);
      }
    }
  }

  nextPhoto(): void {
    const current = this.currentPhotoIndex();
    const photos = this.photos();
    if (current < photos.length - 1) {
      this.currentPhotoIndex.set(current + 1);
      const photo = photos[current + 1];
      if (photo) {
        this.photosState.setSelectedPhoto(photo);
      }
    }
  }

  getCurrentPhoto(): Photo | null {
    return this.photos()[this.currentPhotoIndex()] || null;
  }

  async deletePhoto(id: number | undefined): Promise<void> {
    if (!id || !confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await this.photosApi.deletePhoto(id);
      this.photosState.removePhoto(id);
      if (this.showLightbox()) {
        this.closeLightbox();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  }

  setTagFilter(tag: string): void {
    this.photosState.setTagFilter(tag);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (!this.showLightbox()) return;
    
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      this.previousPhoto();
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto();
    }
  }
}
