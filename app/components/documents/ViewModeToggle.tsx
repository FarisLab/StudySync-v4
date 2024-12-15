'use client';

import React from 'react';
import { ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { ViewMode } from '@/app/types';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center gap-1 bg-black/20 rounded-md border border-white/10 p-1">
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-1 rounded ${
          viewMode === 'list'
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:text-white/80'
        }`}
      >
        <ViewColumnsIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-1 rounded ${
          viewMode === 'grid'
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:text-white/80'
        }`}
      >
        <Squares2X2Icon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ViewModeToggle;
