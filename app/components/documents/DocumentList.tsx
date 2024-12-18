import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BaseDocument } from '@/app/types/document.types';
import { ViewMode } from '@/app/types';
import { LayoutGridIcon, ListIcon } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { getFileIcon } from '@/app/utils/fileIcons';
import { MultiDocumentActions } from './MultiDocumentActions';

interface DocumentListProps {
  documents: BaseDocument[];
  viewMode: ViewMode;
  selectedDocuments: BaseDocument[];
  onDocumentSelect: (documentId: string, event?: React.MouseEvent, isCtrlPressed?: boolean) => void;
  onDocumentClick: (document: BaseDocument) => void;
  onDownload: (document: BaseDocument) => Promise<void>;
  onRename: (document: BaseDocument) => void;
  onDelete: (document: BaseDocument) => void;
  onUpload?: () => void;
  downloadSelectedDocumentsAction: () => Promise<void>;
  isDownloading: boolean;
  setSelectedDocumentsAction: (documents: BaseDocument[]) => void;
  onMoveToTopicAction: (documents: BaseDocument[], topicId: string | null) => Promise<void>;
  onBatchDeleteAction: (documents: BaseDocument[]) => Promise<void>;
}

interface DocumentCardProps {
  id?: string;
  document: BaseDocument;
  viewMode: ViewMode;
  isSelected: boolean;
  selectedDocuments?: BaseDocument[];
  onSelect: (event: React.MouseEvent) => void;
  onClick: (document: BaseDocument) => void;
  onDownload?: (document: BaseDocument) => Promise<void>;
  onRename?: (document: BaseDocument) => void;
  onDelete?: (document: BaseDocument) => void;
  isDragging?: boolean;
  onDragStart?: (document: BaseDocument) => void;
  onDragEnd?: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  viewMode,
  selectedDocuments,
  onDocumentSelect,
  onDocumentClick,
  onDownload,
  onRename,
  onDelete,
  onUpload,
  downloadSelectedDocumentsAction,
  isDownloading,
  setSelectedDocumentsAction,
  onMoveToTopicAction,
  onBatchDeleteAction,
}) => {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [draggingDocumentId, setDraggingDocumentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setIsAtTop(scrollTop === 0);
      setIsAtBottom(Math.abs(scrollHeight - clientHeight - scrollTop) < 1);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleDragStart = (document: BaseDocument) => {
    setDraggingDocumentId(document.id);
  };

  const handleDragEnd = () => {
    setDraggingDocumentId(null);
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-12 h-12 mb-4 text-white/40">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
        <p className="text-white/60">Upload some documents or try a different search</p>
        <button 
          onClick={(e) => {
            e.preventDefault();
            onUpload?.();
          }}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Document
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {selectedDocuments.length > 0 && (
        <MultiDocumentActions
          selectedDocuments={selectedDocuments}
          setSelectedDocumentsAction={setSelectedDocumentsAction}
          downloadSelectedDocumentsAction={downloadSelectedDocumentsAction}
          isDownloading={isDownloading}
          onMoveToTopicAction={onMoveToTopicAction}
          onDeleteAction={onBatchDeleteAction}
        />
      )}
      
      <div 
        ref={containerRef}
        className={`h-full overflow-y-auto scrollbar-none fade-mask ${
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4'
            : 'flex flex-col space-y-2 p-2'
        }`}
        onScroll={handleScroll}
      >
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            id={`document-${document.id}`}
            document={document}
            viewMode={viewMode}
            isSelected={selectedDocuments.some((d) => d.id === document.id)}
            selectedDocuments={selectedDocuments}
            onSelect={(event) => onDocumentSelect(document.id, event, event.ctrlKey)}
            onClick={() => onDocumentClick(document)}
            onDownload={() => onDownload(document)}
            onRename={() => onRename(document)}
            onDelete={() => onDelete(document)}
            isDragging={draggingDocumentId === document.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
