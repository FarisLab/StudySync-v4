'use client';

import { Button } from '../ui/Button';
import { 
  Download,
  Loader2,
  Folder,
  Trash2,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationDialog from '@/app/components/dialogs/DeleteConfirmationDialog';
import { BaseDocument } from '@/app/types/document.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Topic } from '@/app/types';
import { getTopicIcon } from '@/app/utils/topicIcons';
import { ProgressRing } from '../ui/ProgressRing';
import { useDocumentOperations } from '@/app/contexts/DocumentOperationsContext';

const supabase = createClientComponentClient();

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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const { moveProgress, startMoveProgress } = useDocumentOperations();

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const { data: topics, error } = await supabase
          .from('topics')
          .select('*')
          .order('name');

        if (error) throw error;
        setTopics(topics || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const handleMoveToTopic = async (topicId: string | null) => {
    setShowTopicMenu(false);
    
    try {
      // Get the source topic ID (use the first selected document's topic)
      const sourceTopicId = selectedDocuments[0]?.topic_id || null;
      
      // Start progress animation
      await startMoveProgress(sourceTopicId, topicId);
      
      // Move the documents
      await onMoveToTopic(selectedDocuments, topicId);
    } catch (error) {
      console.error('Error moving documents:', error);
    } finally {
      setSelectedDocuments([]);
    }
  };

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
            <AnimatePresence mode="wait">
              {moveProgress ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-6 h-6"
                >
                  <ProgressRing
                    progress={moveProgress.progress}
                    size={24}
                    strokeWidth={2}
                  >
                    <Folder className="w-3 h-3 text-purple-500" />
                  </ProgressRing>
                </motion.div>
              ) : (
                <motion.div
                  key="folder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500/20"
                >
                  <Folder className="w-4 h-4 text-purple-500" />
                </motion.div>
              )}
            </AnimatePresence>
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
                disabled={moveProgress !== null}
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
                      bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    {isLoadingTopics ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleMoveToTopic(null)}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <Folder className="w-4 h-4 text-white/60" />
                          No Topic
                        </Button>

                        {topics.length > 0 && (
                          <div className="h-px w-full bg-white/10 my-1" />
                        )}

                        {topics.map((topic) => {
                          const TopicIcon = getTopicIcon(topic.icon);
                          return (
                            <Button
                              key={topic.id}
                              onClick={() => handleMoveToTopic(topic.id)}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2"
                            >
                              <TopicIcon className="w-4 h-4 text-white/60" />
                              {topic.name}
                            </Button>
                          );
                        })}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Download */}
            <Button
              onClick={downloadSelectedDocuments}
              disabled={isDownloading || moveProgress !== null}
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
              disabled={moveProgress !== null}
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
              disabled={moveProgress !== null}
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
