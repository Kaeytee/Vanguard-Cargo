import { supabase } from '../lib/supabase';

export interface FileUploadOptions {
  bucket: string;
  folder?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  url: string | null;
  error: string | null;
  success: boolean;
}

class FileUploadService {
  private readonly defaultOptions: FileUploadOptions = {
    bucket: 'avatars',
    folder: 'profile-pictures',
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  };

  // Validate file before upload
  private validateFile(file: File, options: FileUploadOptions): string | null {
    // Check file size
    if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
      return `File size must be less than ${Math.round(options.maxSizeBytes / (1024 * 1024))}MB`;
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${options.allowedTypes.join(', ')}`;
    }

    return null;
  }

  // Generate unique filename
  private generateFileName(file: File, userId: string): string {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    return `${userId}_${timestamp}.${extension}`;
  }

  // Upload profile picture
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    try {
      const options = { ...this.defaultOptions };
      
      // Validate file
      const validationError = this.validateFile(file, options);
      if (validationError) {
        return { url: null, error: validationError, success: false };
      }

      // Generate unique filename
      const fileName = this.generateFileName(file, userId);
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      // Delete existing profile picture if it exists
      await this.deleteExistingProfilePicture(userId);

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { url: null, error: uploadError.message, success: false };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        return { url: null, error: 'Failed to get public URL', success: false };
      }

      return { url: urlData.publicUrl, error: null, success: true };
      
    } catch (err) {
      console.error('Profile picture upload error:', err);
      return { 
        url: null, 
        error: err instanceof Error ? err.message : 'Upload failed', 
        success: false 
      };
    }
  }

  // Delete existing profile picture
  private async deleteExistingProfilePicture(userId: string): Promise<void> {
    try {
      const { data: files } = await supabase.storage
        .from(this.defaultOptions.bucket)
        .list(this.defaultOptions.folder, {
          search: userId,
        });

      if (files && files.length > 0) {
        const filesToDelete = files
          .filter(file => file.name.startsWith(userId))
          .map(file => `${this.defaultOptions.folder}/${file.name}`);

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from(this.defaultOptions.bucket)
            .remove(filesToDelete);
        }
      }
    } catch (err) {
      console.warn('Error deleting existing profile picture:', err);
      // Don't throw error, just log it
    }
  }

  // Delete profile picture
  async deleteProfilePicture(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await this.deleteExistingProfilePicture(userId);
      return { success: true, error: null };
    } catch (err) {
      console.error('Delete profile picture error:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Delete failed' 
      };
    }
  }

  // Compress image before upload (optional utility)
  async compressImage(file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw compressed image
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to blob and then to file
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression fails
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const fileUploadService = new FileUploadService();
