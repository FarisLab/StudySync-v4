import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { BaseDocument, ViewMode } from '@/app/types/document.types';

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return DocumentIcon;
    case 'image':
      return PhotoIcon;
    default:
      return DocumentTextIcon;
  }
};

interface DocumentCardProps {
  document: BaseDocument;
  viewMode: ViewMode;
  isSelected?: boolean;
  onSelect?: (event: React.MouseEvent) => void;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDownload: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  dragHandleProps?: any;
}

const isGridMode = (mode: ViewMode): mode is 'grid' => mode === 'grid';

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  viewMode,
  isSelected,
  onSelect,
  onClick,
  onContextMenu,
  onDownload,
  onDelete,
  onRename,
  dragHandleProps,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = getDocumentIcon(document.type);
  const formattedDate = formatDistanceToNow(new Date(document.created_at), { addSuffix: true });
  const formattedSize = formatFileSize(document.size);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(e);
  };

  if (isGridMode(viewMode)) {
    return (
      <div
        className={`group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden 
          hover:bg-black/30 transition-all cursor-pointer
          ${isCtrlPressed ? 'hover:ring-1 hover:ring-purple-500/50' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        {...dragHandleProps}
      >
        {/* Selection Indicators */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors
          ${isSelected ? 'bg-purple-500' : 'bg-transparent group-hover:bg-purple-500/30'}`} 
        />
        {isSelected && (
          <div className="absolute left-3 top-3">
            <CheckIcon className="w-4 h-4 text-purple-500" />
          </div>
        )}

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-white/70" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{document.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                <span>{formattedSize}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {document.topic && (
            <span className="inline-flex px-2 py-1 text-xs rounded-md bg-white/5 text-white/60">
              {document.topic.name}
            </span>
          )}
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-black/90 backdrop-blur-sm 
              border border-white/10 shadow-xl z-10 overflow-hidden"
          >
            <div className="py-1">
              {onRename && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 
                    flex items-center gap-2 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Rename
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 
                    flex items-center gap-2 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative flex items-center hover:bg-white/5 transition-all w-full cursor-pointer
        ${isGridMode(viewMode) 
          ? 'bg-black/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/5 hover:border-white/10' 
          : 'border-b border-white/5'}
        ${isCtrlPressed ? 'hover:ring-1 hover:ring-purple-500/50' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      {...dragHandleProps}
    >
      {/* Selection Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors
        ${isSelected ? 'bg-purple-500' : 'bg-transparent group-hover:bg-purple-500/30'}`} 
      />
      {isSelected && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <CheckIcon className="w-4 h-4 text-purple-500" />
        </div>
      )}

      <div className={`flex-1 flex items-center gap-3 ${isGridMode(viewMode) ? 'p-4' : 'py-3 px-4'} ${isSelected ? 'pl-12' : ''}`}>
        <div className={`${isGridMode(viewMode) ? 'p-3 bg-white/5 rounded-lg' : ''}`}>
          <Icon className={`${isGridMode(viewMode) ? 'w-8 h-8' : 'w-6 h-6'} text-white/70`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white truncate">{document.name}</h3>
            {document.topic && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {document.topic.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-white/50">
            <span>{formattedDate}</span>
            <span>{formattedSize}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-black/90 backdrop-blur-sm 
            border border-white/10 shadow-xl z-10 overflow-hidden"
        >
          <div className="py-1">
            {onRename && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 
                  flex items-center gap-2 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                Rename
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 
                  flex items-center gap-2 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
