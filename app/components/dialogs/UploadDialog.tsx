'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import type { DocumentMetadata, UploadResponse } from '../../types/document.types';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, metadata: DocumentMetadata) => Promise<UploadResponse>;
  selectedTopic: string | null;
}

interface FileWithPreview {
  preview?: string;
  customName?: string;
  progress?: number;
  file: File;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  selectedTopic,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      customName: file.name,
      progress: 0,
    }));
    setFiles(prev => [...prev, ...filesWithPreview]);
    // Initialize progress for each file
    const newProgress: Record<string, number> = {};
    filesWithPreview.forEach(f => {
      newProgress[f.file.name] = 0;
    });
    setUploadProgress(prev => ({ ...prev, ...newProgress }));
  }, []);

  const updateProgress = (fileName: string, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileName]: progress,
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      // Convert files to FileList
      const fileList = new DataTransfer();
      files.forEach(({ file }) => fileList.items.add(file));
      
      // Create metadata with the correct type
      const metadata: DocumentMetadata = {
        topic_id: selectedTopic || undefined
      };
      
      // Mock progress updates (since we can't track actual upload progress)
      const updateInterval = setInterval(() => {
        files.forEach(({ file }) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }));
        });
      }, 200);

      await onUpload(fileList.files, metadata);
      
      // Set all progress to 100% when complete
      const completeProgress: Record<string, number> = {};
      files.forEach(({ file }) => {
        completeProgress[file.name] = 100;
      });
      setUploadProgress(completeProgress);
      
      clearInterval(updateInterval);
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (name: string) => {
    setFiles(files => files.filter(f => f.file.name !== name));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[name];
      return newProgress;
    });
  };

  const updateFileName = (oldName: string, newName: string) => {
    setFiles(files => files.map(fileObj => {
      if (fileObj.file.name === oldName) {
        return { ...fileObj, customName: newName };
      }
      return fileObj;
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 rounded-xl p-6 w-full max-w-xl border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white/90">Upload Documents</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'}`}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-white/40 mb-4" />
          <p className="text-white/70 mb-2">
            Drag 'n' drop files here, or click to select files
          </p>
          <p className="text-white/40 text-sm">
            Supported formats: PDF, Word, PowerPoint, Images
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white/90 font-medium mb-3">Selected Files</h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {files.map((fileObj) => (
                  <motion.div
                    key={fileObj.file.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={fileObj.customName}
                        onChange={(e) => updateFileName(fileObj.file.name, e.target.value)}
                        className="bg-transparent text-white/90 w-full outline-none focus:border-b border-purple-500"
                      />
                      <div className="text-white/40 text-sm mt-1">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      {uploadProgress[fileObj.file.name] > 0 && (
                        <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileObj.file.name]}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(fileObj.file.name)}
                      disabled={isUploading}
                      className={`text-white/40 hover:text-white/90 transition-colors ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white/90 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className={`px-4 py-2 rounded-lg bg-purple-500 text-white font-medium
              ${files.length === 0 || isUploading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-purple-600'} 
              transition-colors`}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDialog;
