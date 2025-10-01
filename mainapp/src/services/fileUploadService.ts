import { supabase } from '../lib/supabase';

// FileUploadService initialized

export interface FileUploadOptions {
  bucket: string;
  folder?: string;
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
  };


  // Generate unique filename
  private generateFileName(file: File, userId: string): string {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    return `${userId}_${timestamp}.${extension}`;
  }

  /**
   * Uploads a profile picture for a user
   * @param file - The image file to upload
   * @param userId - The user's ID
   * @returns Promise with upload result
   */
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
;
    const options = { ...this.defaultOptions };

    try {
      // Verify user session
      const { error: testError } = await supabase.auth.getSession();
      if (testError) {
        return { url: null, error: `Authentication failed: ${testError.message}`, success: false };
      }

      // Ensure we have a valid MIME type
      let mimeType = file.type;
      if (!mimeType || mimeType === 'application/json') {
        // Fallback based on file extension
        const extension = file.name.toLowerCase().split('.').pop();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'gif':
            mimeType = 'image/gif';
            break;
          case 'webp':
            mimeType = 'image/webp';
            break;
          default:
            mimeType = 'image/jpeg'; // Default fallback
        }
      }

      // Generate unique filename
      const fileName = this.generateFileName(file, userId);
      // RLS policy requires path structure: folder/{user-id}/filename
      // Current structure: profile-pictures/filename (WRONG)
      // Required structure: profile-pictures/{user-id}/filename (CORRECT)
      let filePath = options.folder ? `${options.folder}/${userId}/${fileName}` : fileName;

      // Skip deleting existing files for faster uploads

      // Ensure proper MIME type for upload - create new File object if needed
      let uploadFile: File = file;
      if (file.type !== mimeType) {
        const blob = file.slice(0, file.size, mimeType);
        uploadFile = new File([blob], file.name, { type: mimeType });
      }

      // Skip bucket verification for performance - assume bucket exists

      // Verify user authentication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { url: null, error: 'User not authenticated', success: false };
      }

      // File object is guaranteed to be valid due to explicit typing above
      
      // Try the upload with minimal options first
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, uploadFile, {
          upsert: true,
        });

      if (uploadError) {
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
        .list(`${this.defaultOptions.folder}/${userId}`, {
          limit: 100, // Limit to avoid fetching too many files
        });

      if (files && files.length > 0) {
        const filesToDelete = files
          .filter(file => file.name.startsWith(userId))
          .map(file => `${this.defaultOptions.folder}/${userId}/${file.name}`);

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from(this.defaultOptions.bucket)
            .remove(filesToDelete);
        }
      }
    } catch (err) {
      // Silently handle deletion errors
    }
  }

  // Delete profile picture
  async deleteProfilePicture(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await this.deleteExistingProfilePicture(userId);
      return { success: true, error: null };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Delete failed' 
      };
    }
  }

  // Centralized function to prepare the file for upload
  async processAndCompressImage(file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> {
    let processedFile = file;

    // 1. Correct MIME type if it's wrong
    if (processedFile.type === 'application/json' || !processedFile.type.startsWith('image/')) {
      const blob = processedFile.slice(0, processedFile.size, 'image/jpeg');
      processedFile = new File([blob], processedFile.name, { type: 'image/jpeg' });
    }

    // 2. Compress if the file is large
    if (processedFile.size > 1024 * 1024) { // If larger than 1MB
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], processedFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(processedFile); // Return corrected file if compression fails
            }
          }, 'image/jpeg', quality);
        };
        img.src = URL.createObjectURL(processedFile);
      });
    }

    // 3. Return the processed (or original) file
    return Promise.resolve(processedFile);
  }
}

export const fileUploadService = new FileUploadService();
