'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface UploadProgressProps {
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  fileName: string;
  error?: string;
  onCloseAction: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  fileName,
  error,
  onCloseAction,
}) => {
  if (status === 'pending' && !error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 w-80 bg-black/40 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/[0.06]"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-medium text-white">
            {error ? 'Upload Failed' : status === 'complete' ? 'Upload Complete' : 'Uploading...'}
          </h3>
          <button
            onClick={onCloseAction}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-white/60">{progress}% complete</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400">
            <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {status === 'complete' && (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{fileName} uploaded successfully</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadProgress;
