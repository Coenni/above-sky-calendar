export interface Photo {
  id?: number;
  fileName: string;
  filePath: string;
  caption?: string;
  comments?: string; // JSON string
  eventId?: number;
  photoDate?: Date;
  uploadedBy?: number;
  tags?: string;
  uploadedAt?: Date;
  updatedAt?: Date;
}
