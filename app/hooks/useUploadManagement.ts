'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BaseDocument } from '@/app/types/document.types';
import { User } from '@supabase/auth-helpers-nextjs';
import { FileOptions } from '@supabase/storage-js';

const supabase = createClientComponentClient();

export const useUploadManagement = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const resetUploadState = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);
  };

  // Handle file upload
  const handleFileUpload = async (
    file: File,
    user: User,
    topicId: string | null = null
  ): Promise<BaseDocument | null> => {
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError('');
      setUploadSuccess(false);

      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // Create document record in database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert([{
          name: file.name,
          type: file.type,
          size: file.size,
          storage_path: fileName,
          user_id: user.id,
          topic_id: topicId
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadSuccess(true);
      return documentData;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadSuccess,
    handleFileUpload,
    resetUploadState
  };
};
