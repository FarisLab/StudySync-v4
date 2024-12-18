'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseDocument } from '@/app/types/document.types';
import { Topic } from '@/app/types';
import { 
  EllipsisVerticalIcon,
  Squares2X2Icon,
  FolderIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  CalculatorIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  SparklesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { ProgressRing } from '../ui/ProgressRing';
import { useDocumentOperations } from '@/app/contexts/DocumentOperationsContext';

interface TopicListProps {
  topics: Topic[];
  documents: BaseDocument[];
  selectedTopic: string | null;
  topicsSearchQuery: string;
  setTopicsSearchQuery: (query: string) => void;
  onTopicSelect: (topicId: string | null) => void;
  startEditingTopic: (topic: Topic) => void;
  onCreateTopic: () => void;
  onMoveToTopic: (documents: BaseDocument[], topicId: string | null) => Promise<void>;
  storageStats: {
    used: number;
    total: number;
    percentage: number;
  };
}

const ICON_MAP = {
  'Folder': FolderIcon,
  'Book': BookOpenIcon,
  'Academic': AcademicCapIcon,
  'Science': BeakerIcon,
  'Math': CalculatorIcon,
  'Code': CodeBracketIcon,
  'Notes': DocumentTextIcon,
  'Geography': GlobeAltIcon,
  'Music': MusicalNoteIcon,
  'Art': PaintBrushIcon,
  'Games': PuzzlePieceIcon,
  'Physics': RocketLaunchIcon,
  'Magic': SparklesIcon,
} as const;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const TopicList: React.FC<TopicListProps> = ({
  topics,
  documents,
  selectedTopic,
  topicsSearchQuery,
  setTopicsSearchQuery,
  onTopicSelect,
  startEditingTopic,
  onCreateTopic,
  onMoveToTopic,
  storageStats,
}) => {
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const { moveProgress, startMoveProgress } = useDocumentOperations();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const topicId = target.getAttribute('data-topic-id');
    if (topicId && topicId !== dropTargetId) {
      setDropTargetId(topicId);
    }
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = async (e: React.DragEvent, topic: Topic | null) => {
    e.preventDefault();
    setDropTargetId(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'documents') {
        const documents = data.documents as BaseDocument[];
        if (documents.length > 0) {
          const sourceTopicId = documents[0].topic_id ?? null;
          // Start progress animation
          await startMoveProgress(sourceTopicId, topic?.id ?? null);
          
          // Move the documents
          await onMoveToTopic(documents, topic?.id ?? null);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const renderDocumentCount = (topic: Topic | null, count: number) => {
    const topicId = topic?.id || 'root';
    const isMoving = moveProgress?.targetTopicId === topicId || moveProgress?.sourceTopicId === topicId;
    const isDropTarget = dropTargetId === topicId;
    const isSource = moveProgress?.sourceTopicId === topicId;
    const isTarget = moveProgress?.targetTopicId === topicId;
    const isCompleted = moveProgress?.isCompleted;
    
    return (
      <AnimatePresence mode="wait">
        {isMoving || isDropTarget ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <ProgressRing
              progress={isMoving ? moveProgress.progress : 0}
              size={24}
              strokeWidth={2}
              color={isCompleted ? '#10B981' : undefined} // Change to green when completed
            >
              {isMoving && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={isCompleted ? "text-emerald-500" : "text-purple-500"}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-3 h-3" />
                  ) : isSource ? (
                    <ArrowDownIcon className="w-3 h-3" />
                  ) : isTarget ? (
                    <ArrowUpIcon className="w-3 h-3" />
                  ) : (
                    <span className="text-xs text-white/60">{count}</span>
                  )}
                </motion.div>
              )}
              {!isMoving && (
                <span className="text-xs text-white/60">{count}</span>
              )}
            </ProgressRing>
          </motion.div>
        ) : (
          <motion.div
            key="count"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="text-xs text-white/60">{count}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicsSearchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-16rem)] flex flex-col">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={topicsSearchQuery}
          onChange={(e) => setTopicsSearchQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
      </div>

      {/* All Documents Button */}
      <div className="mt-4">
        <motion.button
          onClick={() => onTopicSelect(null)}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
          data-topic-id="root"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedTopic === null
              ? 'bg-purple-500/20 text-white shadow-lg shadow-purple-500/10'
              : 'text-white/60 hover:bg-black/30'
          }`}
        >
          <div 
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              selectedTopic === null
                ? 'bg-purple-500/20'
                : 'bg-white/5'
            }`}
          >
            <Squares2X2Icon 
              className={`w-5 h-5 transition-colors ${
                selectedTopic === null
                  ? 'text-purple-500'
                  : 'text-white/60 group-hover:text-white/80'
              }`}
            />
          </div>
          <span className="flex-1 font-medium antialiased truncate">
            All Documents
          </span>
          <div className="flex items-center gap-2 min-w-[80px] justify-end">
            {renderDocumentCount(null, documents.length)}
          </div>
        </motion.button>
      </div>

      {/* Topics Section */}
      <div className="mt-6 flex flex-col min-h-0">
        {/* Topics Header */}
        <div className="flex items-center gap-3 px-4 mb-3">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Topics</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Scrollable Topics List */}
        <div className="h-[40vh] overflow-y-auto pr-2 scrollbar-none fade-mask">
          <div className="space-y-1.5">
            {filteredTopics.map((topic) => {
              const TopicIcon = ICON_MAP[topic.icon] || FolderIcon;
              const documentCount = documents.filter(doc => doc.topic_id === topic.id).length;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedTopic === topic.id
                      ? 'bg-purple-500/20 text-white shadow-lg shadow-purple-500/10'
                      : 'text-white/60 hover:bg-black/30'
                  } ${
                    dropTargetId === topic.id ? 'ring-2 ring-purple-500 bg-white/5' : ''
                  }`}
                  onClick={() => onTopicSelect(topic.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    startEditingTopic(topic);
                  }}
                  onDragOver={(e) => handleDragOver(e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, topic)}
                  data-topic-id={topic.id}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: `${topic.color}15`,
                      boxShadow: `0 0 20px ${topic.color}10`
                    }}
                  >
                    <TopicIcon 
                      className="w-5 h-5 transition-colors"
                      style={{ color: topic.color }}
                    />
                  </div>
                  <span className="flex-1 font-medium antialiased truncate">{topic.name}</span>
                  <div className="flex items-center gap-2 min-w-[80px] justify-end">
                    {renderDocumentCount(topic, documentCount)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTopic(topic);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="px-2 py-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Storage Section */}
        <div className="pt-2">
          <div className="text-sm text-white/60 font-medium mb-2">Storage</div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500/90 rounded-full transition-all duration-300"
              style={{ width: `${storageStats.percentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
            <span>{formatBytes(storageStats.used)} used</span>
            <span>{formatBytes(storageStats.total)} total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicList;
