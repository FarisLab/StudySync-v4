'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BaseDocument, DocumentType, DocumentSortType } from '@/app/types/document.types';
import { User } from '@supabase/auth-helpers-nextjs';
import { downloadMultipleDocuments, downloadBlob } from '@/app/utils/downloadUtils';
import { toast } from 'sonner';
import { cleanupOrphanedDocuments } from '../utils/storageUtils';

const supabase = createClientComponentClient();

interface UseDocumentManagementProps {
  user: User | null;
  selectedTopic: string | null;
}

/**
 * Custom hook for managing document state and operations
 * @param user - The current authenticated user
 * @param selectedTopic - The currently selected topic ID
 * @returns Object containing document state and management functions
 */
export const useDocumentManagement = ({ user, selectedTopic }: UseDocumentManagementProps) => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<BaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<DocumentSortType>('name-asc');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fileTypeFilter, setFileTypeFilter] = useState<DocumentType | 'all'>('all' as DocumentType | 'all');
  const [selectedDocuments, setSelectedDocuments] = useState<BaseDocument[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Update filtered documents when selectedTopic changes
  useEffect(() => {
    const filtered = selectedTopic
      ? documents.filter(doc => doc.topic_id === selectedTopic)
      : documents;
    setFilteredDocuments(filtered);
  }, [selectedTopic, documents]);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all documents for the user regardless of topic
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Set documents immediately for optimistic loading
      setDocuments(data || []);
      setIsLoading(false);
      
      // Clean up orphaned documents in the background
      cleanupOrphanedDocuments(data || []).then(validDocuments => {
        // Only update if there are any changes
        if (validDocuments.length !== data?.length) {
          setDocuments(validDocuments);
        }
      }).catch(err => {
        console.error('Background cleanup error:', err);
        // Don't set error state as this is a background operation
      });
      
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      setIsLoading(false);
    }
  }, [user]);

  const handleDeleteDocument = async (document: BaseDocument) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!document.storage_path) throw new Error('Invalid document storage path');

      // Start the deletion process
      toast.loading('Deleting document...');

      console.log('Attempting to delete file from storage:', document.storage_path);

      // First, try to delete from storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Only throw if it's not a 'Not Found' error
        if (!storageError.message.includes('Not Found')) {
          throw storageError;
        }
      }

      // Then delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)
        .eq('user_id', user.id); // Add user_id check for extra security

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(d => d.id !== document.id));
      setFilteredDocuments(prev => prev.filter(d => d.id !== document.id));
      setSelectedDocuments(prev => prev.filter(d => d.id !== document.id));

      // Show success message
      toast.success('Document deleted successfully');

      return { success: true };
    } catch (err) {
      console.error('Error deleting document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      toast.error(`Error: ${errorMessage}`);
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
      setFilteredDocuments(prev =>
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
        .update({ topic_id: targetTopicId || undefined })
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc => {
          if (doc.id === documentId) {
            return { ...doc, topic_id: targetTopicId || undefined };
          }
          return doc;
        })
      );
      setFilteredDocuments(prev =>
        prev.map(doc => {
          if (doc.id === documentId) {
            return { ...doc, topic_id: targetTopicId || undefined };
          }
          return doc;
        })
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

  const downloadSelectedDocuments = useCallback(async () => {
    if (selectedDocuments.length === 0) return;

    setIsDownloading(true);
    try {
      const zipBlob = await downloadMultipleDocuments(selectedDocuments);
      
      if (zipBlob) {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadBlob(zipBlob, `documents-${timestamp}.zip`);
      } else {
        throw new Error('Failed to create download package');
      }
    } catch (err) {
      console.error('Error downloading documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to download documents');
    } finally {
      setIsDownloading(false);
    }
  }, [selectedDocuments]);

  /**
   * Handles document selection
   * @param documentId - The ID of the document to select/deselect
   * @param event - Optional mouse event (unused in current implementation)
   * 
   * Clicking a document toggles its selection state:
   * - If the document is not selected, it will be added to the selection
   * - If the document is already selected, it will be removed from the selection
   * Multiple documents can be selected simultaneously
   */
  const handleDocumentSelect = useCallback((documentId: string, event?: React.MouseEvent) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    setSelectedDocuments(prev => {
      // If document is already selected, remove it from selection
      if (prev.some(d => d.id === documentId)) {
        return prev.filter(d => d.id !== documentId);
      }
      // Add document to selection
      return [...prev, document];
    });
  }, [documents]);

  const handleMultipleDocumentsMove = async (documents: BaseDocument[], topicId: string | null) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ topic_id: topicId })
        .in('id', documents.map(d => d.id));

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc => {
          if (documents.some(d => d.id === doc.id)) {
            return { ...doc, topic_id: topicId || undefined };
          }
          return doc;
        })
      );
      setFilteredDocuments(prev =>
        prev.map(doc => {
          if (documents.some(d => d.id === doc.id)) {
            return { ...doc, topic_id: topicId || undefined };
          }
          return doc;
        })
      );

      setSelectedDocuments([]);
      toast.success('Documents moved successfully');
    } catch (error) {
      console.error('Error moving documents:', error);
      toast.error('Failed to move documents');
    }
  };

  const handleMultipleDocumentsDelete = async (documents: BaseDocument[]) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Start the deletion process
      toast.loading(`Deleting ${documents.length} documents...`);

      // First, delete all files from storage
      const storagePaths = documents
        .filter(doc => doc.storage_path) // Filter out any documents without storage paths
        .map(doc => doc.storage_path!);

      if (storagePaths.length > 0) {
        console.log('Attempting to delete files from storage:', storagePaths);
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .remove(storagePaths);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Only throw if it's not a 'Not Found' error
          if (!storageError.message.includes('Not Found')) {
            throw storageError;
          }
        }
      }

      // Then delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .in('id', documents.map(d => d.id))
        .eq('user_id', user.id); // Add user_id check for extra security

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(doc => !documents.some(d => d.id === doc.id)));
      setFilteredDocuments(prev => prev.filter(doc => !documents.some(d => d.id === doc.id)));
      setSelectedDocuments([]);

      // Show success message
      toast.success(`Successfully deleted ${documents.length} documents`);
    } catch (error) {
      console.error('Error deleting documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete documents';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    // Start with documents filtered by topic
    let filtered = [...filteredDocuments];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query)
      );
    }

    // Apply file type filter
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === fileTypeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const [sortField, sortOrder] = sortBy.split('-');
      const direction = sortOrder === 'desc' ? -1 : 1;

      switch (sortField) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'date':
          return direction * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        default:
          return 0;
      }
    });

    return filtered;
  }, [filteredDocuments, searchQuery, fileTypeFilter, sortBy]);

  return {
    documents,
    filteredDocuments,
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
    downloadSelectedDocuments,
    isDownloading,
    handleDeleteDocument,
    handleRenameDocument,
    handleMoveDocument,
    handleDownloadDocument,
    handleMultipleDocumentsMove,
    handleMultipleDocumentsDelete,
    handleDocumentSelect,
    fetchDocuments,
  };
};
