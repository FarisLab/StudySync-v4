'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BaseDocument, DocumentType, DocumentSortType } from '@/app/types/document.types';
import { User } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

interface UseDocumentManagementProps {
  user: User | null;
  selectedTopic: string | null;
}

export const useDocumentManagement = ({ user, selectedTopic }: UseDocumentManagementProps) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<DocumentSortType>('name-asc');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fileTypeFilter, setFileTypeFilter] = useState<DocumentType | 'all'>('all' as DocumentType | 'all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);
        
      if (selectedTopic) {
        query = query.eq('topic_id', selectedTopic);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedTopic]);

  const handleDeleteDocument = async (document: BaseDocument) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // First, try to delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path]);

      if (storageError) {
        // If file doesn't exist in storage, continue with DB deletion
        if (!storageError.message.includes('Not Found')) {
          throw storageError;
        }
      }

      // Then delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(d => d.id !== document.id));
      setSelectedDocuments(prev => prev.filter(id => id !== document.id));

      return { success: true };
    } catch (err) {
      console.error('Error deleting document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleRenameDocument = async (document: BaseDocument, newName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!newName.trim()) throw new Error('Document name cannot be empty');
      
      // Add file extension if it was removed
      const oldExt = document.name.split('.').pop();
      const newExt = newName.split('.').pop();
      const finalName = oldExt && oldExt !== newExt ? `${newName}.${oldExt}` : newName;

      const { error } = await supabase
        .from('documents')
        .update({ name: finalName })
        .eq('id', document.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? { ...doc, name: finalName }
            : doc
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error renaming document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleMoveDocument = async (documentId: string, targetTopicId: string | null) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('documents')
        .update({ topic_id: targetTopicId })
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, topic_id: targetTopicId || undefined }
            : doc
        )
      );
    } catch (err) {
      console.error('Error moving document:', err);
      setError(err instanceof Error ? err.message : 'Failed to move document');
    }
  };

  const handleDownloadDocument = async (doc: BaseDocument): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!doc.storage_path) throw new Error('Invalid document storage path');

      // First, check if the file exists
      const { data: exists } = await supabase.storage
        .from('documents')
        .list(doc.storage_path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: doc.storage_path.split('/').pop(),
        });

      if (!exists || exists.length === 0) {
        throw new Error('File not found in storage');
      }

      // Get download URL
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(doc.storage_path);

      if (downloadError) throw downloadError;
      if (!downloadData) throw new Error('Failed to download file');

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(downloadData);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.name; // Use the document's name for the download
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(link);
      }, 100);

      return { success: true };
    } catch (err) {
      console.error('Error downloading document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to download document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      if (fileTypeFilter === 'all') return true;
      return doc.type === fileTypeFilter;
    });

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      const [sortKey, sortDirection] = sortBy.split('-');
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortKey === 'name') {
        return multiplier * a.name.localeCompare(b.name);
      } else if (sortKey === 'date') {
        return multiplier * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortKey === 'size') {
        return multiplier * (b.size - a.size);
      }
      return 0;
    });

    return filtered;
  }, [documents, searchQuery, fileTypeFilter, sortBy]);

  return {
    documents,
    filteredAndSortedDocuments,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    fileTypeFilter,
    setFileTypeFilter,
    selectedDocuments,
    setSelectedDocuments,
    fetchDocuments,
    handleDeleteDocument,
    handleRenameDocument,
    handleMoveDocument,
    handleDownloadDocument,
  };
};
