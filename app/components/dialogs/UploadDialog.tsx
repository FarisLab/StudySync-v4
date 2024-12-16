'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog } from '@headlessui/react';
import { ArrowUpTrayIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import type { DocumentMetadata, UploadResponse } from '../../types/document.types';
import { useToast } from '@/app/hooks/useToast';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10; // Maximum number of files per upload

interface UploadDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onUpload: (files: File[], metadata: DocumentMetadata) => Promise<UploadResponse>;
  selectedTopic: string | null;
}

interface FileWithPreview {
  preview?: string;
  customName: string;
  progress?: number;
  file: File;
  isEditing?: boolean;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  isOpen,
  onCloseAction,
  onUpload,
  selectedTopic,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(progressIntervalRef.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  const simulateProgress = (fileName: string) => {
    let progress = 0;
    progressIntervalRef.current[fileName] = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 95) {
        clearInterval(progressIntervalRef.current[fileName]);
        progress = 95; // Cap at 95% until actual completion
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: Math.min(Math.round(progress), 95)
      }));
    }, 300);
  };

  const completeProgress = (fileName: string) => {
    clearInterval(progressIntervalRef.current[fileName]);
    setUploadProgress(prev => ({
      ...prev,
      [fileName]: 100
    }));
  };

  const resetProgress = () => {
    Object.values(progressIntervalRef.current).forEach(interval => {
      clearInterval(interval);
    });
    progressIntervalRef.current = {};
    setUploadProgress({});
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > MAX_FILES) {
      showToast({
        title: 'Upload Error',
        message: `Maximum ${MAX_FILES} files allowed per upload`,
        type: 'error'
      });
      return;
    }

    const filesWithPreview = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      customName: file.name,
      progress: 0,
      isEditing: false,
    }));
    setFiles(prev => [...prev, ...filesWithPreview]);
    setUploadProgress(prev => ({
      ...prev,
      ...Object.fromEntries(filesWithPreview.map(f => [f.file.name, 0]))
    }));
  }, [files, showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(({ file, errors }) => {
        if (errors[0]?.code === 'file-too-large') {
          return `${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
        }
        if (errors[0]?.code === 'file-invalid-type') {
          return `${file.name} has an invalid file type. Supported formats: PDF, Word, PowerPoint, Images`;
        }
        return `${file.name} could not be uploaded: ${errors[0]?.message}`;
      });
      showToast({
        title: 'Upload Error',
        message: errors[0],
        type: 'error'
      });
    }
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    resetProgress();

    try {
      // Start progress simulation for each file
      files.forEach(({ file }) => {
        simulateProgress(file.name);
      });

      // Create an array of renamed files
      const renamedFiles = files.map(({ file, customName }) => 
        new File([file], customName, { type: file.type })
      );
      
      // Create metadata with the correct type
      const metadata: DocumentMetadata = {
        topic_id: selectedTopic || undefined
      };
      
      const response = await onUpload(renamedFiles, metadata);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to upload files');
      }

      // Complete progress for all files
      files.forEach(({ file }) => {
        completeProgress(file.name);
      });
      
      showToast({
        title: 'Success',
        message: 'Files uploaded successfully',
        type: 'success'
      });

      // Short delay to show 100% completion before closing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles([]);
      onCloseAction();
    } catch (error) {
      resetProgress();
      showToast({
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload files',
        type: 'error'
      });
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

  const startEditing = (name: string) => {
    setFiles(files => files.map(fileObj => ({
      ...fileObj,
      isEditing: fileObj.file.name === name,
    })));
  };

  const updateFileName = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    
    setFiles(files => files.map(fileObj => {
      if (fileObj.file.name === oldName) {
        // Preserve file extension
        const oldExt = oldName.split('.').pop();
        const newExt = newName.split('.').pop();
        const finalName = newExt !== oldExt ? `${newName}.${oldExt}` : newName;
        
        return {
          ...fileObj,
          customName: finalName,
          isEditing: false,
        };
      }
      return fileObj;
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, oldName: string) => {
    if (e.key === 'Enter') {
      updateFileName(oldName, (e.target as HTMLInputElement).value);
    } else if (e.key === 'Escape') {
      setFiles(files => files.map(fileObj => ({
        ...fileObj,
        isEditing: false,
      })));
    }
  };

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) {
      return <div className="bg-red-500/20 text-red-500">PDF</div>;
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return <div className="bg-blue-500/20 text-blue-500">DOC</div>;
    } else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return <div className="bg-orange-500/20 text-orange-500">PPT</div>;
    } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif')) {
      return <div className="bg-green-500/20 text-green-500">IMG</div>;
    } else {
      return <div className="bg-white/10 text-white/60">FILE</div>;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isUploading && onCloseAction()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-2xl rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="absolute right-4 top-4">
            <button
              onClick={onCloseAction}
              disabled={isUploading}
              className="text-white/60 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <Dialog.Title className="text-lg font-semibold text-white mb-1">
              Upload Documents
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/60 mb-4">
              Upload your documents to StudySync. Maximum {MAX_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)}MB each.
            </Dialog.Description>

            <div
              {...getRootProps()}
              className={`relative rounded-lg border-2 border-dashed border-white/20 p-8 transition-colors
                ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'hover:border-white/40 hover:bg-white/5'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className={`p-3 rounded-full transition-colors
                  ${isDragActive ? 'bg-purple-500/20 text-purple-500' : 'bg-white/10 text-white/60'}`}>
                  <ArrowUpTrayIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
                  </p>
                  <p className="text-xs text-white/60">
                    Supported formats: PDF, Word, PowerPoint, Images
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                  </h3>
                  {!isUploading && (
                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {files.map(({ file, customName, progress = 0, isEditing }, index) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative flex items-center gap-3 p-3 rounded-lg bg-white/5 group"
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg
                        ${file.type.includes('pdf') ? 'bg-red-500/20 text-red-500' :
                          file.type.includes('word') ? 'bg-blue-500/20 text-blue-500' :
                          file.type.includes('powerpoint') ? 'bg-orange-500/20 text-orange-500' :
                          file.type.includes('image') ? 'bg-green-500/20 text-green-500' :
                          'bg-white/10 text-white/60'}`}
                      >
                        {getFileIcon(file.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={customName}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setFiles(files.map((f, i) =>
                                i === index ? { ...f, customName: newName } : f
                              ));
                            }}
                            onBlur={() => {
                              setFiles(files.map((f, i) =>
                                i === index ? { ...f, isEditing: false } : f
                              ));
                            }}
                            className="w-full bg-transparent text-sm text-white border-b border-white/20 focus:border-purple-500 outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white truncate">{customName}</span>
                            {!isUploading && (
                              <button
                                onClick={() => {
                                  setFiles(files.map((f, i) =>
                                    i === index ? { ...f, isEditing: true } : f
                                  ));
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <PencilIcon className="w-3 h-3 text-white/60 hover:text-white" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/60">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          {isUploading && (
                            <>
                              <span className="text-xs text-white/60">•</span>
                              <span className={`text-xs ${
                                uploadProgress[file.name] === 100 
                                  ? 'text-green-500' 
                                  : uploadProgress[file.name] > 0 
                                    ? 'text-purple-500' 
                                    : 'text-white/60'
                              }`}>
                                {uploadProgress[file.name] || 0}%
                              </span>
                            </>
                          )}
                        </div>
                        {isUploading && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden rounded-b-lg">
                            <div
                              className={`h-full transition-all duration-300 ${
                                uploadProgress[file.name] === 100 
                                  ? 'bg-green-500' 
                                  : 'bg-purple-500'
                              }`}
                              style={{ 
                                width: `${uploadProgress[file.name] || 0}%`,
                                transition: 'width 0.3s ease-in-out'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {!isUploading && (
                        <button
                          onClick={() => removeFile(file.name)}
                          className="p-1 text-white/60 hover:text-white transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onCloseAction}
                disabled={isUploading}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${files.length === 0 || isUploading
                    ? 'bg-purple-500/50 text-white/60 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'}`}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UploadDialog;
