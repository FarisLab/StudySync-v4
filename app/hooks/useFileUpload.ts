'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

interface UseFileUploadProps {
  user: User | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  topicId?: string | null;
}

interface FileWithCustomName extends File {
  customName?: string;
}

interface DocumentMetadata {
  name?: string;
  topic_id?: string | null;
}

export const useFileUpload = ({ user, onSuccess, onError, topicId }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileWithCustomName[], metadata?: DocumentMetadata) => {
    if (!user) {
      onError?.('User not authenticated');
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        const fileName = file.customName || metadata?.name || file.name;
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        const fileType = getFileType(fileExt);
        
        if (!fileType) {
          throw new Error(`Unsupported file type: ${fileExt}`);
        }

        // Create a unique storage path
        const timestamp = Date.now();
        const storagePath = `${user.id}/${timestamp}-${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // Insert document record
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            name: fileName,
            type: fileType,
            size: file.size,
            storage_path: storagePath,
            user_id: user.id,
            topic_id: metadata?.topic_id || topicId,
          });

        if (insertError) throw insertError;
      }

      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading,
  };
};

const getFileType = (extension?: string): string | null => {
  if (!extension) return null;

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  const documentTypes = ['pdf', 'doc', 'docx'];
  const presentationTypes = ['ppt', 'pptx'];

  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (presentationTypes.includes(extension)) return 'presentation';

  return null;
};
