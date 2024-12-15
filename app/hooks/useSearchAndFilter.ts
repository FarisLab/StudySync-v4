'use client';

import { useState, useMemo } from 'react';
import { BaseDocument } from '@/app/types/document.types';
import { DocumentType, ViewMode } from '@/app/types';

type SortOrder = 'asc' | 'desc';

export const useSearchAndFilter = (documents: BaseDocument[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [fileTypeFilter, setFileTypeFilter] = useState<DocumentType | null>(null);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query)
      );
    }

    // Apply file type filter
    if (fileTypeFilter) {
      filtered = filtered.filter(doc => doc.type === fileTypeFilter);
    }

    // Apply sorting by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [documents, searchQuery, fileTypeFilter, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortOrder,
    setSortOrder,
    fileTypeFilter,
    setFileTypeFilter,
    filteredDocuments
  };
};
