// ============================================================================
// Image Utilities
// ============================================================================
// Description: Helper functions for handling images and avatars
// Author: Senior Software Engineer
// Features: Supabase storage URL construction, company logo as default avatar
// Architecture: Clean Code, OOP Principles, Type-Safe
// ============================================================================

import { supabase } from '../lib/supabase';
import { APP_LOGO } from '../lib/constants';

/**
 * Get the full public URL for a Supabase storage file
 * 
 * @param bucketName - The storage bucket name (e.g., 'avatars')
 * @param filePath - The file path in the bucket
 * @returns Full public URL or null if invalid
 */
export function getSupabaseStorageUrl(bucketName: string, filePath: string | null | undefined): string | null {
  // Handle null/undefined/empty paths
  if (!filePath || filePath.trim() === '') {
    return null;
  }

  // If it's already a full URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  try {
    // Get the public URL from Supabase
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return null;
  }
}

/**
 * Get avatar URL with fallback to company logo
 * 
 * @param avatarUrl - The avatar URL from user profile
 * @returns Avatar URL or company logo as default
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  // If no avatar URL, use company logo as default
  if (!avatarUrl || avatarUrl.trim() === '') {
    return APP_LOGO;
  }

  // If it's already a full URL, return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If it's a storage path, construct the full URL
  const fullUrl = getSupabaseStorageUrl('avatars', avatarUrl);
  
  // Return the full URL or company logo if construction failed
  return fullUrl || APP_LOGO;
}

/**
 * Check if an image URL is valid and accessible
 * 
 * @param url - Image URL to check
 * @returns Promise that resolves to true if valid
 */
export async function isImageValid(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * Get optimized avatar URL with size parameter
 * 
 * @param avatarUrl - The avatar URL from user profile
 * @param _size - Desired size in pixels (default: 128) - Reserved for future use
 * @returns Optimized avatar URL or default
 */
export function getOptimizedAvatarUrl(
  avatarUrl: string | null | undefined,
  _size: number = 128
): string {
  const url = getAvatarUrl(avatarUrl);
  
  // If it's the default logo, return as-is
  if (url === APP_LOGO) {
    return url;
  }

  // For Supabase URLs, we could add transformation parameters in the future
  // For now, just return the URL
  // TODO: Add image transformation with size parameter when implementing CDN
  return url;
}

export default {
  getSupabaseStorageUrl,
  getAvatarUrl,
  isImageValid,
  getOptimizedAvatarUrl,
};
