'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

interface UseFileUploadProps {
  user: User | null;
  topicId?: string | null;
}

interface FileWithCustomName extends File {
  customName?: string;
}

interface DocumentMetadata {
  name?: string;
  topic_id?: string | null;
}

interface UploadResponse {
  success: boolean;
  error?: string;
}

export const useFileUpload = ({ user, topicId }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileWithCustomName[], metadata?: DocumentMetadata): Promise<UploadResponse> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsUploading(true);
    console.log('Starting file upload in useFileUpload...');

    try {
      for (const file of files) {
        const fileName = file.customName || metadata?.name || file.name;
        console.log('Uploading file:', fileName);
        
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        const fileType = getFileType(fileExt);
        
        if (!fileType) {
          return { success: false, error: `Unsupported file type: ${fileExt}` };
        }

        // Create a unique storage path
        const timestamp = Date.now();
        const storagePath = `${user.id}/${timestamp}-${fileName}`;
        console.log('Storage path:', storagePath);

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return { success: false, error: uploadError.message };
        }

        // Insert document record into the database
        const { error: dbError } = await supabase
          .from('documents')
          .insert([
            {
              name: fileName,
              storage_path: storagePath,
              type: fileType,
              size: file.size,
              user_id: user.id,
              topic_id: metadata?.topic_id || topicId,
            },
          ]);

        if (dbError) {
          console.error('Database error:', dbError);
          return { success: false, error: dbError.message };
        }
      }

      console.log('All files uploaded successfully');
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error during upload'
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading
  };
};

const getFileType = (extension?: string): string | null => {
  if (!extension) return null;

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  const documentTypes = ['doc', 'docx'];
  const presentationTypes = ['ppt', 'pptx'];

  if (extension === 'pdf') return 'pdf';
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (presentationTypes.includes(extension)) return 'presentation';

  return null;
};
