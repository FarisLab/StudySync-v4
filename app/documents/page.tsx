'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import UploadDialog from '../components/UploadDialog';
import DocumentsToolbar from '../components/DocumentsToolbar';
import { 
  FolderPlusIcon, 
  ArrowUpTrayIcon, 
  TrashIcon,
  PencilIcon,
  FolderIcon,
  DocumentIcon,
  CloudArrowDownIcon,
  PlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUturnRightIcon,
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileOptions } from '@supabase/storage-js';
import { format } from 'date-fns';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// Add types for documents
interface Topic {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

interface UserDocument {
  id: number;
  name: string;
  type: string;
  size: number;
  created_at: string;
  user_id: string;
  storage_path: string;
  topic_id: number | null;
  topic?: Topic | null;
}

interface ProgressEvent {
  loaded: number;
  total: number;
}

const supabase = createClientComponentClient();

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function Documents() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicColor, setNewTopicColor] = useState('#6366F1');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [showTopicMenu, setShowTopicMenu] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(null);
  const [isRenamingTopic, setIsRenamingTopic] = useState(false);
  const [topicNewName, setTopicNewName] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [topicsSearchQuery, setTopicsSearchQuery] = useState('');
  const [topicsSortBy, setTopicsSortBy] = useState('name');
  const [uncategorizedSearchQuery, setUncategorizedSearchQuery] = useState('');
  const [uncategorizedSortBy, setUncategorizedSortBy] = useState('name');
  const [uncategorizedFileTypeFilter, setUncategorizedFileTypeFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/auth');
          return;
        }
        setUser(user);
      } catch (err) {
        console.error('Error checking authentication:', err);
        router.push('/auth');
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    fetchDocuments();
    fetchTopics();
  }, [selectedTopic, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showFileMenu) setShowFileMenu(null);
      if (showTopicMenu) setShowTopicMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFileMenu, showTopicMenu]);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_FILE_TYPES = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'];

  const handleFileUpload = async (files: FileList, topicId: number | null) => {
    if (!files || !user) return;

    setUploadError('');
    setIsUploading(true);
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name} is too large. Maximum size is 50MB`);
        continue;
      }

      // Validate file type
      const isValidType = ALLOWED_FILE_TYPES.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type);
        }
        return file.type.match(new RegExp(type.replace('*', '.*')));
      });

      if (!isValidType) {
        setUploadError(`${file.name} is not a supported file type`);
        continue;
      }

      const promise = new Promise(async (resolve, reject) => {
        try {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { data, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              onUploadProgress: (progress) => {
                setUploadProgress(prev => ({
                  ...prev,
                  [file.name]: Math.round((progress.loaded / progress.total) * 100)
                }));
              }
            });

          if (uploadError) throw uploadError;
          
          // Create document record
          const { error: dbError } = await supabase
            .from('documents')
            .insert([{
              name: file.name,
              size: file.size,
              type: file.type,
              storage_path: filePath,
              user_id: user.id,
              topic_id: topicId
            }]);

          if (dbError) throw dbError;
          resolve(file.name);
        } catch (error) {
          reject(error);
        }
      });

      uploadPromises.push(promise);
    }

    try {
      const uploaded = await Promise.all(uploadPromises);
      setShowSuccessMessage(`Successfully uploaded ${uploaded.length} file(s)`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
      fetchDocuments();
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload some files. Please try again.');
    } finally {
      setUploadProgress({});
      setIsUploading(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkMove = async (targetTopicId: string | null) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ topic_id: targetTopicId })
        .in('id', selectedFiles);

      if (error) throw error;

      setShowSuccessMessage(`Successfully moved ${selectedFiles.length} file(s)`);
      setSelectedFiles([]);
      fetchDocuments();
    } catch (error) {
      setUploadError('Failed to move files. Please try again.');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Get documents to delete
      const { data: docs, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .in('id', selectedDocuments);

      if (fetchError) throw fetchError;
      if (!docs) throw new Error('No documents found');

      // Delete files from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(docs.map(doc => doc.storage_path));

      if (storageError) throw storageError;

      // Delete records from the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .in('id', selectedDocuments);

      if (dbError) throw dbError;

      // Clear selection and refresh list
      setSelectedDocuments([]);
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete documents');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRename = async () => {
    if (!newName || selectedDocuments.length !== 1) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ name: newName })
        .eq('id', selectedDocuments[0]);

      if (error) throw error;

      setNewName('');
      setIsRenaming(false);
      setSelectedDocuments([]);
      fetchDocuments();
    } catch (err) {
      console.error('Error renaming document:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename document');
    }
  };

  const handleDownload = async (doc: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.storage_path);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const fetchTopics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('topics')
        .insert([
          {
            name: newTopicName.trim(),
            color: newTopicColor,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTopics(prev => [...prev, data]);
      setNewTopicName('');
      setIsAddingTopic(false);
    } catch (err) {
      console.error('Error adding topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to add topic');
    }
  };

  const handleAssignTopic = async (documentId: number, topicId: number | null) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ topic_id: topicId })
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, topic_id: topicId, topic: topics.find(t => t.id === topicId) || null }
            : doc
        )
      );
    } catch (err) {
      console.error('Error assigning topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign topic');
    }
  };

  const handleEditTopic = async () => {
    if (!topicNewName.trim() || !editingTopicId) return;

    try {
      const { error } = await supabase
        .from('topics')
        .update({
          name: topicNewName.trim(),
          color: newTopicColor,
        })
        .eq('id', editingTopicId);

      if (error) throw error;

      setTopics(prev =>
        prev.map(topic =>
          topic.id === editingTopicId
            ? { ...topic, name: topicNewName.trim(), color: newTopicColor }
            : topic
        )
      );

      // Update documents with this topic to reflect the changes
      setDocuments(prev =>
        prev.map(doc =>
          doc.topic_id === editingTopicId
            ? { ...doc, topic: { ...doc.topic!, name: topicNewName.trim(), color: newTopicColor } }
            : doc
        )
      );

      setTopicNewName('');
      setNewTopicColor('#6366F1');
      setIsEditingTopic(false);
      setEditingTopicId(null);
    } catch (err) {
      console.error('Error editing topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit topic');
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      
      // Update documents that had this topic
      setDocuments(prev =>
        prev.map(doc =>
          doc.topic_id === topicId
            ? { ...doc, topic_id: null, topic: null }
            : doc
        )
      );

      if (selectedTopic === topicId) {
        setSelectedTopic(null);
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
    }
  };

  const startEditingTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTopicNewName(topic.name);
    setNewTopicColor(topic.color);
    setIsEditingTopic(true);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) return;

      const query = supabase
        .from('documents')
        .select('*, topic:topics(*)')
        .eq('user_id', user.id);

      if (selectedTopic) {
        query.eq('topic_id', selectedTopic);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      if (!user) return;

      // Get the document to delete
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;
      if (!doc) throw new Error('Document not found');

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete record from the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setShowSuccessMessage('Document deleted successfully');
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleRenameFile = async (document: UserDocument) => {
    if (!document || !user) return;
    
    setSelectedDocuments([document.id]);
    setNewName(document.name);
    setIsRenaming(true);
  };

  const handleDownloadDocument = async (document: UserDocument) => {
    try {
      if (!user) return;

      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  // Drag and Drop handlers
  const handleFileDrop = useCallback(async (documentId: number, targetTopicId: number | null) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('documents')
        .update({ topic_id: targetTopicId })
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, topic_id: targetTopicId, topic: topics.find(t => t.id === targetTopicId) || null }
            : doc
        )
      );

      setShowSuccessMessage('Document moved successfully');
    } catch (err) {
      console.error('Error moving document:', err);
      setError(err instanceof Error ? err.message : 'Failed to move document');
    }
  }, [user, topics]);

  // File Component with Drag support
  const FileItem = ({ document }: { document: UserDocument }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'FILE',
      item: { id: document.id, type: 'FILE' },
      canDrag: () => !!user,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        className={`flex items-center justify-between p-3 rounded-lg transition-colors group
          ${isDragging ? 'opacity-50' : 'bg-white/5 hover:bg-white/8'}`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white/5">
            <DocumentIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-medium">{document.name}</h4>
            <p className="text-white/40 text-sm">
              {format(new Date(document.created_at), 'MMM d, yyyy')} · {formatFileSize(document.size)}
            </p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFileMenu(document.id);
            }}
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            <EllipsisHorizontalIcon className="w-5 h-5 text-white/60" />
          </button>
          
          {showFileMenu === document.id && (
            <div 
              className="absolute right-0 mt-8 w-48 bg-gray-900 rounded-lg border border-white/10 shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button
                  onClick={() => handleRenameFile(document)}
                  className="w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 text-left flex items-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => handleDownloadDocument(document)}
                  className="w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 text-left flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDeleteDocument(document.id)}
                  className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 text-left flex items-center space-x-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Topic Card with Drop support
  const TopicCard = ({ topic }: { topic: Topic }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'FILE',
      drop: (item: { id: number }) => handleFileDrop(item.id, topic.id),
      canDrop: () => !!user,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    const topicDocuments = documents.filter(doc => doc.topic_id === topic.id);
    const lastUpdated = topicDocuments.length > 0 
      ? new Date(Math.max(...topicDocuments.map(doc => new Date(doc.created_at).getTime())))
      : null;

    return (
      <div
        ref={drop}
        onClick={() => setSelectedTopic(topic.id)}
        className={`p-4 rounded-xl transition-all cursor-pointer group relative
          ${isOver ? 'border-2 border-purple-500 bg-purple-500/10' :
          selectedTopic === topic.id
            ? 'bg-white/10 border-2 border-purple-500'
            : 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-purple-500/30'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-lg bg-white/5"
              style={{ backgroundColor: `${topic.color}20` }}
            >
              <FolderIcon className="w-6 h-6" style={{ color: topic.color }} />
            </div>
            <div>
              <h3 className="text-white font-medium">{topic.name}</h3>
              <p className="text-white/40 text-sm">
                {topicDocuments.length} {topicDocuments.length === 1 ? 'file' : 'files'}
              </p>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTopicMenu(topic.id);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10"
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-white/60" />
            </button>

            {showTopicMenu === topic.id && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg border border-white/10 shadow-lg z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTopic(topic);
                    }}
                    className="w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 text-left flex items-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(topic.id);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 text-left flex items-center space-x-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {lastUpdated && (
          <p className="text-white/40 text-xs mt-3">
            Last updated: {format(lastUpdated, 'MMM d, yyyy')}
          </p>
        )}
      </div>
    );
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    // First, filter by topic if selected
    let filtered = documents.filter(doc => 
      selectedTopic ? doc.topic_id === selectedTopic : true
    );

    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query)
      );
    }

    // Filter by file type
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(doc => {
        const extension = doc.name.split('.').pop()?.toLowerCase() || '';
        switch (fileTypeFilter) {
          case 'pdf':
            return extension === 'pdf';
          case 'doc':
            return ['doc', 'docx'].includes(extension);
          case 'image':
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          case 'other':
            return !['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          default:
            return true;
        }
      });
    }

    // Finally, sort the documents
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });
  }, [documents, selectedTopic, searchQuery, sortBy, fileTypeFilter]);

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = topics;

    // Filter by search query
    if (topicsSearchQuery) {
      const query = topicsSearchQuery.toLowerCase();
      filtered = filtered.filter(topic => 
        topic.name.toLowerCase().includes(query)
      );
    }

    // Sort topics
    return [...filtered].sort((a, b) => {
      switch (topicsSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'count':
          const countA = documents.filter(doc => doc.topic_id === a.id).length;
          const countB = documents.filter(doc => doc.topic_id === b.id).length;
          return countB - countA;
        default:
          return 0;
      }
    });
  }, [topics, topicsSearchQuery, topicsSortBy, documents]);

  const filteredAndSortedUncategorized = useMemo(() => {
    // Get uncategorized documents
    let filtered = documents.filter(doc => !doc.topic_id);

    // Filter by search query
    if (uncategorizedSearchQuery) {
      const query = uncategorizedSearchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query)
      );
    }

    // Filter by file type
    if (uncategorizedFileTypeFilter !== 'all') {
      filtered = filtered.filter(doc => {
        const extension = doc.name.split('.').pop()?.toLowerCase() || '';
        switch (uncategorizedFileTypeFilter) {
          case 'pdf':
            return extension === 'pdf';
          case 'doc':
            return ['doc', 'docx'].includes(extension);
          case 'image':
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          case 'other':
            return !['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          default:
            return true;
        }
      });
    }

    // Sort documents
    return [...filtered].sort((a, b) => {
      switch (uncategorizedSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });
  }, [documents, uncategorizedSearchQuery, uncategorizedSortBy, uncategorizedFileTypeFilter]);

  const FileList = () => (
    <div className="space-y-3">
      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
          <span className="text-white/70">
            {selectedFiles.length} file(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <select
              onChange={(e) => handleBulkMove(e.target.value || null)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Move to...</option>
              <option value={null}>Uncategorized</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Files Grid */}
      <div className="grid gap-3">
        {filteredAndSortedDocuments.map((document) => (
          <div
            key={document.id}
            className={`flex items-center p-3 rounded-lg transition-colors group
              ${selectedFiles.includes(document.id) ? 'bg-purple-500/20' : 'bg-white/5 hover:bg-white/8'}`}
          >
            <div className="flex-shrink-0 mr-3">
              <input
                type="checkbox"
                checked={selectedFiles.includes(document.id)}
                onChange={() => toggleFileSelection(document.id)}
                className="rounded border-white/10 text-purple-500 focus:ring-purple-500"
              />
            </div>
            <FileItem document={document} />
          </div>
        ))}
      </div>
    </div>
  );

  const Notifications = () => (
    <>
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {showSuccessMessage}
        </div>
      )}
      {uploadError && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {uploadError}
        </div>
      )}
    </>
  );

  // Render loading state
  if (!mounted) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900">
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-white/10 p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
            </div>
          </div>
        )}
        
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <Sidebar />
          <DisplayPanel>
            <PageTransition>
              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                  <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
                  <p className="text-white/60">Manage and organize your files</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:border-purple-500/50 text-left"
                  >
                    <ArrowUpTrayIcon className="h-6 w-6 text-purple-400 mb-4" />
                    <h3 className="text-white/80 text-lg font-semibold">Upload Files</h3>
                    <p className="text-white/40 text-sm mt-1">Add new documents to your workspace</p>
                  </button>

                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-white/80 text-lg font-semibold mb-4">Storage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white/60">
                        <span>Used Space</span>
                        <span>7.7 GB of 10 GB</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '77%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Management */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  {/* Breadcrumb Navigation */}
                  <nav className="flex items-center space-x-2 mb-6">
                    <button 
                      onClick={() => setSelectedTopic(null)}
                      className="text-white hover:text-purple-400 transition-colors font-medium"
                    >
                      Your Documents
                    </button>
                    {selectedTopic && (
                      <>
                        <ChevronRightIcon className="w-4 h-4 text-white/40" />
                        <span className="text-purple-400 font-medium">
                          {topics.find(t => t.id === selectedTopic)?.name}
                        </span>
                      </>
                    )}
                  </nav>

                  {/* Split View Layout */}
                  {!selectedTopic && (
                    <div className="flex gap-6">
                      {/* Topics Section (Left 2/3) */}
                      <div className="flex-[2] space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-white">Topics</h2>
                          <button
                            onClick={() => setIsAddingTopic(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 
                              text-purple-400 rounded-lg transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                            <span className="text-sm">New Topic</span>
                          </button>
                        </div>

                        {/* Topics Toolbar */}
                        <div className="flex gap-3 mb-4">
                          {/* Search */}
                          <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                              type="text"
                              value={topicsSearchQuery}
                              onChange={(e) => setTopicsSearchQuery(e.target.value)}
                              placeholder="Search topics..."
                              className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/40
                                focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
                                hover:border-white/20 transition-all"
                            />
                          </div>

                          {/* Sort */}
                          <div className="relative">
                            <select
                              value={topicsSortBy}
                              onChange={(e) => setTopicsSortBy(e.target.value)}
                              className="appearance-none bg-black/30 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white
                                focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
                                hover:border-white/20 transition-all cursor-pointer"
                            >
                              <option value="name">Name</option>
                              <option value="date">Date</option>
                              <option value="count">File Count</option>
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <ArrowsUpDownIcon className="h-4 w-4 text-white/40" />
                            </div>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                              <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Topics List */}
                        <div className="flex-1 overflow-y-auto">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500"></div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredAndSortedTopics.map((topic) => (
                                <TopicCard key={topic.id} topic={topic} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Uncategorized Documents Section (Right 1/3) */}
                      <div className="flex-1 border-l border-white/10 pl-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Uncategorized</h2>

                        {/* Uncategorized Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                          {/* Search */}
                          <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-4 w-4 text-white/40" />
                            </div>
                            <input
                              type="text"
                              value={uncategorizedSearchQuery}
                              onChange={(e) => setUncategorizedSearchQuery(e.target.value)}
                              placeholder="Search files..."
                              className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/40
                                focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
                                hover:border-white/20 transition-all"
                            />
                          </div>

                          <div className="flex gap-2">
                            {/* Sort */}
                            <div className="relative">
                              <select
                                value={uncategorizedSortBy}
                                onChange={(e) => setUncategorizedSortBy(e.target.value)}
                                className="appearance-none bg-black/30 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white
                                  focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
                                  hover:border-white/20 transition-all cursor-pointer"
                              >
                                <option value="name">Name</option>
                                <option value="date">Date</option>
                                <option value="size">Size</option>
                              </select>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ArrowsUpDownIcon className="h-4 w-4 text-white/40" />
                              </div>
                              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* Filter */}
                            <div className="relative">
                              <select
                                value={uncategorizedFileTypeFilter}
                                onChange={(e) => setUncategorizedFileTypeFilter(e.target.value)}
                                className="appearance-none bg-black/30 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white
                                  focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-transparent
                                  hover:border-white/20 transition-all cursor-pointer"
                              >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF</option>
                                <option value="doc">Word</option>
                                <option value="image">Images</option>
                                <option value="other">Others</option>
                              </select>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FunnelIcon className="h-4 w-4 text-white/40" />
                              </div>
                              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Uncategorized Files List */}
                        <div className="flex-1 overflow-y-auto">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500"></div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredAndSortedUncategorized.map((doc) => (
                                <div
                                  key={doc.id}
                                  className={`flex items-center p-3 rounded-lg transition-colors group
                                    ${selectedFiles.includes(doc.id) ? 'bg-purple-500/20' : 'bg-white/5 hover:bg-white/8'}`}
                                >
                                  <div className="flex-shrink-0 mr-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedFiles.includes(doc.id)}
                                      onChange={() => toggleFileSelection(doc.id)}
                                      className="rounded border-white/10 text-purple-500 focus:ring-purple-500"
                                    />
                                  </div>
                                  <FileItem document={doc} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Topic View */}
                  {selectedTopic && (
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full flex flex-col">
                        {/* Toolbar */}
                        <DocumentsToolbar
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                          sortBy={sortBy}
                          onSortChange={setSortBy}
                          fileTypeFilter={fileTypeFilter}
                          onFilterChange={setFileTypeFilter}
                        />

                        {/* Documents List */}
                        <div className="flex-1 overflow-y-auto">
                          {isLoading ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
                            </div>
                          ) : (
                            <FileList />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PageTransition>
          </DisplayPanel>
        </div>

        {/* Upload Dialog */}
        <UploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => {
            setIsUploadDialogOpen(false);
            setUploadProgress({});
            setUploadError('');
          }}
          onUpload={handleFileUpload}
          topics={topics}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          error={uploadError}
        />
        
        <Notifications />
      </div>
    </DndProvider>
  );
}
