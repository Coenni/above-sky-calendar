import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { AuthService } from '../../services/auth.service';
import { Photo } from '../../models/photo.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  photos: Photo[] = [];
  filteredPhotos: Photo[] = [];
  currentUser: User | null = null;
  isLoading = false;
  showLightbox = false;
  currentPhotoIndex = 0;
  showUploadForm = false;
  
  newPhoto: Photo = {
    fileName: '',
    filePath: '',
    caption: '',
    uploadedBy: 0
  };

  constructor(
    private photoService: PhotoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.isLoading = true;
    this.photoService.getAllPhotos().subscribe({
      next: (photos) => {
        this.photos = photos;
        this.filteredPhotos = photos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        this.isLoading = false;
      }
    });
  }

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
    if (this.showUploadForm) {
      this.newPhoto = {
        fileName: '',
        filePath: '',
        caption: '',
        uploadedBy: this.currentUser?.id || 0
      };
    }
  }

  uploadPhoto(): void {
    if (!this.newPhoto.filePath) {
      alert('Please provide an image URL');
      return;
    }

    // Set fileName from filePath if not provided
    if (!this.newPhoto.fileName) {
      this.newPhoto.fileName = this.newPhoto.filePath.split('/').pop() || 'photo.jpg';
    }

    this.photoService.createPhoto(this.newPhoto).subscribe({
      next: (photo) => {
        this.photos.unshift(photo);
        this.filteredPhotos = this.photos;
        this.toggleUploadForm();
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo');
      }
    });
  }

  openLightbox(index: number): void {
    this.currentPhotoIndex = index;
    this.showLightbox = true;
  }

  closeLightbox(): void {
    this.showLightbox = false;
  }

  previousPhoto(): void {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
    }
  }

  nextPhoto(): void {
    if (this.currentPhotoIndex < this.filteredPhotos.length - 1) {
      this.currentPhotoIndex++;
    }
  }

  getCurrentPhoto(): Photo | null {
    return this.filteredPhotos[this.currentPhotoIndex] || null;
  }

  deletePhoto(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    this.photoService.deletePhoto(id).subscribe({
      next: () => {
        this.photos = this.photos.filter(p => p.id !== id);
        this.filteredPhotos = this.photos;
        if (this.showLightbox) {
          this.closeLightbox();
        }
      },
      error: (error) => {
        console.error('Error deleting photo:', error);
        alert('Failed to delete photo');
      }
    });
  }

  handleKeydown(event: KeyboardEvent): void {
    if (!this.showLightbox) return;
    
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      this.previousPhoto();
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto();
    }
  }
}
