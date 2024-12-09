import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Topic } from '../types';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, topicId: number | null) => Promise<void>;
  topics: Topic[];
  uploadProgress: { [key: string]: number };
  isUploading: boolean;
  error?: string;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  topics,
  uploadProgress,
  isUploading,
  error
}) => {
  const [selectedTopic, setSelectedTopic] = React.useState<number | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onUpload(e.dataTransfer.files, selectedTopic);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      await onUpload(e.target.files, selectedTopic);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-2xl flex items-center justify-center p-6 z-50"
        >
          {/* Glow Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="glow-orb absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="glow-orb absolute bottom-1/4 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="relative z-10 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl"
          >
            {/* Header Section */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Upload Files</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Select Topic (Optional)
                </label>
                <div className="relative">
                  <select
                    value={selectedTopic || ""}
                    onChange={(e) => setSelectedTopic(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white appearance-none
                      focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
                      hover:border-white/20 transition-all cursor-pointer"
                  >
                    <option value="">No Topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-2xl bg-black/30
                  ${dragActive 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : 'border-white/10 hover:border-white/20 hover:bg-black/40'
                  }
                  transition-all duration-200 cursor-pointer group
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  onChange={handleChange}
                  className="hidden"
                />

                <div className="py-8 px-4">
                  <div className="transform group-hover:scale-105 transition-transform duration-200 text-center">
                    <div className="bg-purple-500/20 backdrop-blur-xl rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                      <ArrowUpTrayIcon className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-base font-medium text-white mb-1">
                      Drag and drop your files here
                    </h3>
                    <p className="text-sm text-white/60 mb-4">
                      or click to browse from your computer
                    </p>
                    <button
                      onClick={handleButtonClick}
                      className="px-5 py-2 bg-purple-500/80 backdrop-blur-sm hover:bg-purple-500 text-white text-sm rounded-lg
                        transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-lg shadow-purple-500/20
                        focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80 font-medium truncate pr-4">{fileName}</span>
                        <span className="text-white/60 font-medium whitespace-nowrap">{progress}%</span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="bg-purple-500/80 backdrop-blur-sm h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl"
                >
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadDialog;
