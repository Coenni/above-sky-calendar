import { Injectable, signal, computed, effect } from '@angular/core';
import { Photo } from '../../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotosStateService {
  // Private writable signals
  private _photos = signal<Photo[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedPhoto = signal<Photo | null>(null);
  private _uploadProgress = signal(0);
  private _tagFilter = signal<string>('all');
  
  // Public readonly signals
  readonly photos = this._photos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedPhoto = this._selectedPhoto.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly tagFilter = this._tagFilter.asReadonly();
  
  // Computed signals
  readonly filteredPhotos = computed(() => {
    const photos = this._photos();
    const filter = this._tagFilter();
    
    if (filter === 'all') return photos;
    
    return photos.filter(photo => {
      if (!photo.tags) return false;
      return photo.tags.includes(filter);
    });
  });
  
  readonly sortedPhotos = computed(() => {
    return [...this.filteredPhotos()].sort((a, b) => {
      const dateA = a.photoDate ? new Date(a.photoDate).getTime() : 0;
      const dateB = b.photoDate ? new Date(b.photoDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  });
  
  readonly photosByEvent = computed(() => {
    const photoMap = new Map<number, Photo[]>();
    this._photos().forEach(photo => {
      if (photo.eventId) {
        const existing = photoMap.get(photo.eventId) || [];
        photoMap.set(photo.eventId, [...existing, photo]);
      }
    });
    return photoMap;
  });
  
  readonly allTags = computed(() => {
    const tagsSet = new Set<string>();
    this._photos().forEach(photo => {
      if (photo.tags) {
        photo.tags.split(',').forEach(tag => {
          const trimmedTag = tag.trim();
          if (trimmedTag) tagsSet.add(trimmedTag);
        });
      }
    });
    return Array.from(tagsSet).sort();
  });
  
  readonly recentPhotos = computed(() => 
    this.sortedPhotos().slice(0, 10)
  );
  
  readonly photoStats = computed(() => ({
    totalPhotos: this._photos().length,
    photosWithCaptions: this._photos().filter(p => p.caption).length,
    photosWithTags: this._photos().filter(p => p.tags).length,
    totalTags: this.allTags().length,
    photosLinkedToEvents: this._photos().filter(p => p.eventId).length
  }));
  
  constructor() {
    // Persist tag filter preference
    const savedFilter = localStorage.getItem('photos-tag-filter');
    if (savedFilter) {
      this._tagFilter.set(savedFilter);
    }
    
    effect(() => {
      const filter = this._tagFilter();
      localStorage.setItem('photos-tag-filter', filter);
    });
  }
  
  // Methods to update state
  setPhotos(photos: Photo[]) {
    this._photos.set(photos);
  }
  
  addPhoto(photo: Photo) {
    this._photos.update(photos => [...photos, photo]);
  }
  
  updatePhoto(id: number, updates: Partial<Photo>) {
    this._photos.update(photos => 
      photos.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }
  
  removePhoto(id: number) {
    this._photos.update(photos => photos.filter(p => p.id !== id));
  }
  
  setSelectedPhoto(photo: Photo | null) {
    this._selectedPhoto.set(photo);
  }
  
  setUploadProgress(progress: number) {
    this._uploadProgress.set(progress);
  }
  
  setTagFilter(filter: string) {
    this._tagFilter.set(filter);
  }
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  getPhotosForEvent(eventId: number): Photo[] {
    return this._photos().filter(p => p.eventId === eventId);
  }
  
  getPhotosByTag(tag: string): Photo[] {
    return this._photos().filter(p => p.tags && p.tags.includes(tag));
  }
  
  reset() {
    this._photos.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._selectedPhoto.set(null);
    this._uploadProgress.set(0);
    this._tagFilter.set('all');
  }
}
