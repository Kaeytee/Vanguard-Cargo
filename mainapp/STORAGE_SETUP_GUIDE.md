# Storage Bucket Setup Guide

The profile picture upload feature requires a storage bucket named `avatars` to be created in your Supabase project.

## Current Status
- **Available buckets**: None (`Array []`)
- **Required bucket**: `avatars`
- **SQL approach**: Failed (no buckets created)

## Solution: Create Bucket via Supabase Dashboard

### Step 1: Access Storage
1. Go to your **Supabase Dashboard**
2. Select your project
3. Click **"Storage"** in the left sidebar

### Step 2: Create New Bucket
1. Click **"New bucket"** button
2. Fill in the form:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **ENABLE THIS** (required for profile pictures)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: 
     ```
     image/jpeg
     image/png
     image/webp
     image/gif
     ```
3. Click **"Create bucket"**

### Step 3: Set Up Policies (Optional)
The bucket will work with default policies, but for better security, you can add RLS policies via SQL Editor:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars  
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### Step 4: Test Upload
After creating the bucket, try uploading a profile picture. The debug logs should show:
- ✅ `Available buckets: ["avatars"]`
- ✅ `Found bucket: { id: "avatars", ... }`
- ✅ Successful upload

## Troubleshooting

### If Storage Tab is Missing
- Storage might not be enabled for your project
- Check your Supabase plan (some features require paid plans)
- Verify you're in the correct project

### If Bucket Creation Fails
- Check your user permissions
- Ensure you're the project owner or have storage permissions
- Try refreshing the dashboard and trying again

### If Upload Still Fails After Bucket Creation
- Check browser console for detailed error logs
- Verify the bucket is public
- Ensure MIME types include your image format
