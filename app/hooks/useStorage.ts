import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface StorageInfo {
  usedBytes: number;
  totalBytes: number;
  percentUsed: number;
}

export const useStorage = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    usedBytes: 0,
    totalBytes: 10 * 1024 * 1024 * 1024, // 10GB default limit
    percentUsed: 0
  });

  const supabase = createClientComponentClient();

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const fetchStorageInfo = async () => {
    try {
      // For now, we'll just get the size of all documents
      const { data: documents, error } = await supabase
        .from('documents')
        .select('size_bytes');

      if (error) throw error;

      const usedBytes = documents.reduce((total, doc) => total + (doc.size_bytes || 0), 0);
      const percentUsed = (usedBytes / storageInfo.totalBytes) * 100;

      setStorageInfo({
        usedBytes,
        totalBytes: storageInfo.totalBytes,
        percentUsed
      });
    } catch (error) {
      console.error('Error fetching storage info:', error);
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  return {
    usedStorage: formatBytes(storageInfo.usedBytes),
    totalStorage: formatBytes(storageInfo.totalBytes),
    percentUsed: storageInfo.percentUsed,
    refresh: fetchStorageInfo
  };
};
