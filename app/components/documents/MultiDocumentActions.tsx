'use client';

import { Button } from '../ui/Button';
import { 
  Download,
  Loader2,
  Folder,
  Trash2,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationDialog from '@/app/components/dialogs/DeleteConfirmationDialog';
import { BaseDocument } from '@/app/types/document.types';

/**
 * Interface for MultiDocumentActions component props
 */
interface MultiDocumentActionsProps {
  /** Array of currently selected documents */
  selectedDocuments: BaseDocument[];
  /** Function to update the selected documents */
  setSelectedDocumentsAction: (documents: BaseDocument[]) => void;
  /** Function to download selected documents as a zip file */
  downloadSelectedDocumentsAction: () => Promise<void>;
  /** Flag indicating if a download is in progress */
  isDownloading: boolean;
  /** Function to move selected documents to a topic */
  onMoveToTopicAction: (documents: BaseDocument[], topicId: string | null) => Promise<void>;
  /** Function to delete selected documents */
  onDeleteAction: (documents: BaseDocument[]) => Promise<void>;
}

/**
 * Component that displays actions available for selected documents
 * 
 * Features:
 * - Move documents to a topic
 * - Download selected documents as zip
 * - Delete selected documents
 * - Clear selection
 * 
 * The component appears as a floating action bar at the bottom of the screen
 * when one or more documents are selected.
 */
export function MultiDocumentActions({
  selectedDocuments,
  setSelectedDocumentsAction: setSelectedDocuments,
  downloadSelectedDocumentsAction: downloadSelectedDocuments,
  isDownloading,
  onMoveToTopicAction: onMoveToTopic,
  onDeleteAction: onDelete
}: MultiDocumentActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTopicMenu, setShowTopicMenu] = useState(false);

  if (selectedDocuments.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="flex items-center gap-2 px-4 py-3 
            bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Selection Info */}
          <div className="flex items-center gap-2 px-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500/20">
              <Folder className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-white">
              {selectedDocuments.length} {selectedDocuments.length === 1 ? 'document' : 'documents'} selected
            </span>
          </div>
          
          <div className="h-4 w-px bg-white/10 mx-2" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Move to Topic */}
            <div className="relative">
              <Button
                onClick={() => setShowTopicMenu(!showTopicMenu)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                Move to
              </Button>

              <AnimatePresence>
                {showTopicMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full left-0 mb-2 w-56 py-1 
                      bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl"
                  >
                    <Button
                      onClick={() => {
                        onMoveToTopic(selectedDocuments, null);
                        setShowTopicMenu(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      No Topic
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Download */}
            <Button
              onClick={downloadSelectedDocuments}
              disabled={isDownloading}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download ({selectedDocuments.length})
                </>
              )}
            </Button>

            {/* Delete */}
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-red-400/80 
                hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>

            {/* Clear Selection */}
            <div className="h-4 w-px bg-white/10 mx-1" />
            <Button
              onClick={() => setSelectedDocuments([])}
              variant="ghost"
              size="sm"
              className="p-1.5 text-white/60 hover:text-white"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onCloseAction={() => setShowDeleteConfirm(false)}
        onConfirmAction={() => {
          onDelete(selectedDocuments);
          setShowDeleteConfirm(false);
        }}
        title="Delete Documents"
        message={`Are you sure you want to delete ${selectedDocuments.length} ${
          selectedDocuments.length === 1 ? 'document' : 'documents'
        }? This action cannot be undone.`}
      />
    </div>
  );
}
