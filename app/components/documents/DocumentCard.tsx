import React, { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { BaseDocument, ViewMode } from '@/app/types/document.types';
import { getFileIcon } from '@/app/utils/fileIcons';
import DeleteConfirmationDialog from '@/app/components/dialogs/DeleteConfirmationDialog'; // Assuming the DeleteConfirmationDialog component is in the same directory

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Props for the DocumentCard component
 */
interface DocumentCardProps {
  /** The document to display */
  document: BaseDocument;
  /** Current view mode (grid or list) */
  viewMode: ViewMode;
  /** Whether the document is currently selected */
  isSelected?: boolean;
  /** Handler for document selection */
  onSelect?: (event: React.MouseEvent) => void;
  /** Handler for document click */
  onClick?: () => void;
  /** Handler for context menu */
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Handler for document download */
  onDownload: () => void;
  /** Handler for document deletion */
  onDelete?: () => void;
  /** Handler for document rename */
  onRename?: () => void;
  /** Props for drag handle functionality */
  dragHandleProps?: any;
}

/**
 * Component that displays a single document as a card
 * 
 * Features:
 * - Displays document metadata (name, type, size, date)
 * - Shows selection state with visual indicators
 * - Provides quick actions (download, rename, delete)
 * - Supports both grid and list view modes
 * - Handles document selection through click events
 * - Shows topic association if document belongs to a topic
 */
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const formattedDate = formatDistanceToNow(new Date(document.created_at), { addSuffix: true });
  const formattedSize = formatFileSize(document.size);

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
          hover:bg-black/30 transition-all cursor-pointer`}
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
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg 
              ${document.type === 'pdf' ? 'bg-red-500/20' :
                document.type === 'document' ? 'bg-blue-500/20' :
                document.type === 'image' ? 'bg-green-500/20' :
                document.type === 'spreadsheet' ? 'bg-emerald-500/20' :
                document.type === 'presentation' ? 'bg-orange-500/20' :
                'bg-white/5'}`}>
              <div className={`w-6 h-6 
                ${document.type === 'pdf' ? 'text-red-500' :
                  document.type === 'document' ? 'text-blue-500' :
                  document.type === 'image' ? 'text-green-500' :
                  document.type === 'spreadsheet' ? 'text-emerald-500' :
                  document.type === 'presentation' ? 'text-orange-500' :
                  'text-white/60'}`}>
                {getFileIcon(document.name)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{document.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className={`px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider
                  ${document.type === 'pdf' ? 'bg-red-500/20 text-red-500' :
                    document.type === 'document' ? 'bg-blue-500/20 text-blue-500' :
                    document.type === 'image' ? 'bg-green-500/20 text-green-500' :
                    document.type === 'spreadsheet' ? 'bg-emerald-500/20 text-emerald-500' :
                    document.type === 'presentation' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-white/10 text-white/60'}`}>
                  {document.type}
                </span>
                <span className="text-white/50">{formattedSize}</span>
                <span className="text-white/50">•</span>
                <span className="text-white/50">{formattedDate}</span>
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
                    setShowDeleteConfirm(true);
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
        {showDeleteConfirm && onDelete && (
          <DeleteConfirmationDialog
            isOpen={showDeleteConfirm}
            onCloseAction={() => setShowDeleteConfirm(false)}
            onConfirmAction={() => {
              onDelete();
              setShowDeleteConfirm(false);
            }}
            title="Delete Document"
            message={`Are you sure you want to delete "${document.name}"? This action cannot be undone.`}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative flex items-center hover:bg-white/5 transition-all w-full cursor-pointer
        ${isGridMode(viewMode) 
          ? 'bg-black/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/5 hover:border-white/10' 
          : 'border-b border-white/5'}`}
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
          <div className={`w-10 h-10 flex items-center justify-center rounded-lg 
            ${document.type === 'pdf' ? 'bg-red-500/20' :
              document.type === 'document' ? 'bg-blue-500/20' :
              document.type === 'image' ? 'bg-green-500/20' :
              document.type === 'spreadsheet' ? 'bg-emerald-500/20' :
              document.type === 'presentation' ? 'bg-orange-500/20' :
              'bg-white/5'}`}>
            <div className={`w-6 h-6 
              ${document.type === 'pdf' ? 'text-red-500' :
                document.type === 'document' ? 'text-blue-500' :
                document.type === 'image' ? 'text-green-500' :
                document.type === 'spreadsheet' ? 'text-emerald-500' :
                document.type === 'presentation' ? 'text-orange-500' :
                'text-white/60'}`}>
              {getFileIcon(document.name)}
            </div>
          </div>
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
            <span className={`px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider
              ${document.type === 'pdf' ? 'bg-red-500/20 text-red-500' :
                document.type === 'document' ? 'bg-blue-500/20 text-blue-500' :
                document.type === 'image' ? 'bg-green-500/20 text-green-500' :
                document.type === 'spreadsheet' ? 'bg-emerald-500/20 text-emerald-500' :
                document.type === 'presentation' ? 'bg-orange-500/20 text-orange-500' :
                'bg-white/10 text-white/60'}`}>
              {document.type}
            </span>
            <span className="text-white/50">{formattedDate}</span>
            <span className="text-white/50">{formattedSize}</span>
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
                  setShowDeleteConfirm(true);
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
      {showDeleteConfirm && onDelete && (
        <DeleteConfirmationDialog
          isOpen={showDeleteConfirm}
          onCloseAction={() => setShowDeleteConfirm(false)}
          onConfirmAction={() => {
            onDelete();
            setShowDeleteConfirm(false);
          }}
          title="Delete Document"
          message={`Are you sure you want to delete "${document.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default DocumentCard;
