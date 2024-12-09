import React from 'react';
import { MagnifyingGlassIcon, ArrowsUpDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface DocumentsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  fileTypeFilter: string;
  onFilterChange: (filter: string) => void;
}

const DocumentsToolbar: React.FC<DocumentsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  fileTypeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full">
      {/* Search Bar */}
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-white/40" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search documents..."
          className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40
            focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
            hover:border-white/20 transition-all"
        />
      </div>

      <div className="flex gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white
              focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
              hover:border-white/20 transition-all cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="size">Size</option>
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowsUpDownIcon className="h-5 w-5 text-white/40" />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={fileTypeFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="appearance-none bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white
              focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
              hover:border-white/20 transition-all cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="image">Images</option>
            <option value="other">Others</option>
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FunnelIcon className="h-5 w-5 text-white/40" />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsToolbar;
