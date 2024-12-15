'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
} from '@heroicons/react/24/outline';

interface TopicListProps {
  topics: Topic[];
  documents: BaseDocument[];
  selectedTopic: string | null;
  topicsSearchQuery: string;
  setTopicsSearchQuery: (query: string) => void;
  onTopicSelect: (topicId: string | null) => void;
  startEditingTopic: (topic: Topic) => void;
  onCreateTopic: () => void;
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

const TopicList: React.FC<TopicListProps> = ({
  topics,
  documents,
  selectedTopic,
  topicsSearchQuery,
  setTopicsSearchQuery,
  onTopicSelect,
  startEditingTopic,
  onCreateTopic,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="relative">
        <input
          type="text"
          value={topicsSearchQuery}
          onChange={(e) => setTopicsSearchQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <PlusIcon
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 hover:text-purple-400 cursor-pointer transition-colors"
          onClick={onCreateTopic}
        />
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto mt-4 pr-2">
        <motion.button
          onClick={() => onTopicSelect(null)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`group w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
            selectedTopic === null
              ? 'bg-purple-500/20 text-white shadow-lg shadow-purple-500/10'
              : 'text-white/60 hover:bg-black/30'
          }`}
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: 'white15',
              boxShadow: '0 0 20px white10'
            }}
          >
            <Squares2X2Icon 
              className="w-5 h-5 transition-colors"
              style={{ color: 'white' }}
            />
          </div>
          <span className="flex-1 font-medium antialiased truncate">{documents.length > 0 ? 'All Documents' : 'No Documents'}</span>
          <div className="flex items-center gap-2 min-w-[80px] justify-end">
            <span className="text-sm px-2 py-0.5 rounded-full bg-white/5">{documents.length}</span>
          </div>
        </motion.button>

        <div className="flex items-center gap-3 px-4 my-3 opacity-60">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Topics</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {topics.map((topic) => {
          const Icon = ICON_MAP[topic.icon] || FolderIcon;
          const documentCount = documents.filter(doc => doc.topic_id === topic.id).length;
          const iconColorClass = topic.color || 'white';

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
              }`}
              onClick={() => onTopicSelect(topic.id)}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: `${topic.color}15`,
                  boxShadow: `0 0 20px ${topic.color}10`
                }}
              >
                <Icon 
                  className="w-5 h-5 transition-colors"
                  style={{ color: topic.color }}
                />
              </div>
              <span className="flex-1 font-medium antialiased truncate">{topic.name}</span>
              <div className="flex items-center gap-2 min-w-[80px] justify-end">
                <span className="text-sm px-2 py-0.5 rounded-full bg-white/5">{documentCount}</span>
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
  );
};

export default TopicList;
