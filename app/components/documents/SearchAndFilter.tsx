import { MagnifyingGlassIcon, ArrowsUpDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { DocumentType, DocumentSortType } from '@/app/types/document.types';
import Dropdown from '../ui/Dropdown';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: DocumentSortType;
  onSortChange: (sort: DocumentSortType) => void;
  fileTypeFilter: DocumentType | 'all';
  onFilterChange: (filter: DocumentType | 'all') => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  fileTypeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Search Bar */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl 
            text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Sort Dropdown */}
      <Dropdown
        value={sortBy}
        onChange={(value) => onSortChange(value as DocumentSortType)}
        options={[
          { value: 'name-asc', label: 'Name (A-Z)' },
          { value: 'name-desc', label: 'Name (Z-A)' },
          { value: 'date-desc', label: 'Newest First' },
          { value: 'date-asc', label: 'Oldest First' },
        ]}
        icon={ArrowsUpDownIcon}
        placeholder="Sort by"
      />

      {/* Type Filter Dropdown */}
      <Dropdown
        value={fileTypeFilter}
        onChange={(value) => onFilterChange(value as DocumentType | 'all')}
        options={[
          { value: 'all', label: 'All Types' },
          { value: 'pdf', label: 'PDF' },
          { value: 'doc', label: 'Word' },
          { value: 'txt', label: 'Text' },
        ]}
        icon={FunnelIcon}
        placeholder="File Type"
      />
    </div>
  );
};

export default SearchAndFilter;
