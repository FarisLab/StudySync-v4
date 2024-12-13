'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import DocumentsToolbar from '../components/DocumentsToolbar';
import FileItem from '../components/FileItem';
import TopicDialog from '../components/TopicDialog';
import { 
  XMarkIcon, 
  FolderIcon,
  Squares2X2Icon,
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
} from '@heroicons/react/24/outline';
import { 
  FolderPlusIcon, 
  ArrowUpTrayIcon, 
  TrashIcon,
  PencilIcon,
  DocumentIcon,
  CloudArrowDownIcon,
  PlusIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUturnRightIcon,
  ListBulletIcon,
  ShareIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileOptions } from '@supabase/storage-js';
import { format } from 'date-fns';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import type { DocumentType } from '@/app/types/document.types';

// Add types for documents
interface Topic {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
  documents: UserDocument[];
}

interface TopicDocument {
  topic_id: string;
  document_id: string;
  created_at: string;
}

interface UserDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  user_id: string;
  storage_path: string;
  topic_id: string | null;
  topic?: Topic | null;
}

interface ProgressEvent {
  loaded: number;
  total: number;
}

interface DocumentMetadata {
  topic_id?: string;
}

interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  fileName: string;
}

interface UploadResponse {
  fileId: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
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

// Shared icon mapping with TopicDialog
const PRESET_ICONS = [
  { icon: FolderIcon, name: 'Folder' },
  { icon: BookOpenIcon, name: 'Book' },
  { icon: AcademicCapIcon, name: 'Academic' },
  { icon: BeakerIcon, name: 'Science' },
  { icon: CalculatorIcon, name: 'Math' },
  { icon: CodeBracketIcon, name: 'Code' },
  { icon: DocumentTextIcon, name: 'Notes' },
  { icon: GlobeAltIcon, name: 'Geography' },
  { icon: MusicalNoteIcon, name: 'Music' },
  { icon: PaintBrushIcon, name: 'Art' },
  { icon: PuzzlePieceIcon, name: 'Games' },
  { icon: RocketLaunchIcon, name: 'Physics' },
  { icon: SparklesIcon, name: 'Magic' },
] as const;

export default function Documents() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicColor, setNewTopicColor] = useState('#6366F1');
  const [newTopicIcon, setNewTopicIcon] = useState('Folder');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [fileTypeFilter, setFileTypeFilter] = useState<DocumentType | 'all'>('all');
  const [showFileMenu, setShowFileMenu] = useState<string | null>(null);
  const [showTopicMenu, setShowTopicMenu] = useState<string | null>(null);
  const [isRenamingTopic, setIsRenamingTopic] = useState(false);
  const [topicNewName, setTopicNewName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [topicsSearchQuery, setTopicsSearchQuery] = useState('');
  const [topicsSortBy, setTopicsSortBy] = useState('name');
  const [uncategorizedSearchQuery, setUncategorizedSearchQuery] = useState('');
  const [uncategorizedSortBy, setUncategorizedSortBy] = useState('name');
  const [uncategorizedFileTypeFilter, setUncategorizedFileTypeFilter] = useState<DocumentType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [topicDialogMode, setTopicDialogMode] = useState<'create' | 'edit'>('create');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

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

  const handleFileUpload = async (files: FileList, metadata?: DocumentMetadata): Promise<UploadResponse> => {
    if (!user) throw new Error('Not authenticated');
    
    setIsUploading(true);
    setUploadError('');
    const uploadPromises: Promise<UploadResponse>[] = [];
    const timestamp = new Date().getTime();
    const currentTopicId = metadata?.topic_id;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const filePath = `${user.id}/${timestamp}-${uniqueId}-${file.name}`;

      const promise = new Promise<UploadResponse>(async (resolve, reject) => {
        try {
          // First upload the file
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }

          // Update progress after upload completes
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              progress: 100,
              status: 'complete',
              fileName: file.name
            }
          }));
          
          // Create document record
          const { data: docData, error: dbError } = await supabase
            .from('documents')
            .insert([{
              name: file.name,
              size: file.size,
              type: file.type,
              storage_path: filePath,
              user_id: user.id,
              topic_id: currentTopicId,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (dbError) {
            // If database insert fails, clean up the uploaded file
            await supabase.storage
              .from('documents')
              .remove([filePath]);
            throw new Error(`Failed to create document record for ${file.name}: ${dbError.message}`);
          }

          // Get the URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

          resolve({
            fileId: docData.id.toString(),
            url: publicUrl,
            size: file.size,
            type: file.type,
            uploadedAt: new Date()
          });
        } catch (error) {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              progress: 0,
              status: 'error',
              fileName: file.name
            }
          }));
          reject(error);
        }
      });

      uploadPromises.push(promise);
    }

    try {
      const results = await Promise.all(uploadPromises);
      await fetchDocuments(); // Refresh documents after all uploads complete
      setIsUploading(false);
      return results[0]; // Return the first upload response
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) 
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    );
  };

  const handleBulkMove = async (targetTopicId: string) => {
    if (!selectedFiles.length) return;

    try {
      const topicIdValue = targetTopicId === 'null' ? null : targetTopicId ? parseInt(targetTopicId) : null;
      
      const { error } = await supabase
        .from('documents')
        .update({ topic_id: topicIdValue ? String(topicIdValue) : null })
        .in('id', selectedFiles);

      if (error) throw error;

      // Update local state
      setDocuments(prev =>
        prev.map(doc =>
          selectedFiles.includes(doc.id)
            ? { ...doc, topic_id: topicIdValue ? String(topicIdValue) : null }
            : doc
        )
      );

      setSelectedFiles([]);
    } catch (err) {
      console.error('Error moving files:', err);
      setError(err instanceof Error ? err.message : 'Failed to move files');
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

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to download document');
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
            icon: newTopicIcon,
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

  const handleAssignTopic = async (documentId: string, topicId: string | null) => {
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
          icon: newTopicIcon,
        })
        .eq('id', editingTopicId);

      if (error) throw error;

      setTopics(prev =>
        prev.map(topic =>
          topic.id === editingTopicId
            ? { ...topic, name: topicNewName.trim(), color: newTopicColor, icon: newTopicIcon }
            : topic
        )
      );

      // Update documents with this topic to reflect the changes
      setDocuments(prev =>
        prev.map(doc =>
          doc.topic_id === editingTopicId
            ? { ...doc, topic: { ...doc.topic!, name: topicNewName.trim(), color: newTopicColor, icon: newTopicIcon } }
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

  const handleDeleteTopic = async (topicId: string) => {
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
    setEditingTopic(topic);
    setTopicDialogMode('edit');
    setIsTopicDialogOpen(true);
  };

  const handleTopicSubmit = async (name: string, color: string, iconName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (topicDialogMode === 'create') {
        // Try to insert with icon field, fallback to without if column doesn't exist yet
        const { data, error } = await supabase
          .from('topics')
          .insert([
            {
              name: name.trim(),
              color: color,
              icon: iconName,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (error && error.message.includes('icon')) {
          // If icon column doesn't exist, try without it
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('topics')
            .insert([
              {
                name: name.trim(),
                color: color,
                user_id: user.id,
              },
            ])
            .select()
            .single();

          if (fallbackError) throw fallbackError;
          setTopics(prev => [...prev, { ...fallbackData, icon: 'Folder' }]);
        } else if (error) {
          throw error;
        } else {
          setTopics(prev => [...prev, data]);
        }
      } else {
        if (!editingTopic) return;

        // Try to update with icon field, fallback to without if column doesn't exist yet
        const { error } = await supabase
          .from('topics')
          .update({
            name: name.trim(),
            color: color,
            icon: iconName,
          })
          .eq('id', editingTopic.id);

        if (error && error.message.includes('icon')) {
          // If icon column doesn't exist, try without it
          const { error: fallbackError } = await supabase
            .from('topics')
            .update({
              name: name.trim(),
              color: color,
            })
            .eq('id', editingTopic.id);

          if (fallbackError) throw fallbackError;
          
          setTopics(prev =>
            prev.map(topic =>
              topic.id === editingTopic.id
                ? { ...topic, name: name.trim(), color: color, icon: 'Folder' }
                : topic
            )
          );
        } else if (error) {
          throw error;
        } else {
          setTopics(prev =>
            prev.map(topic =>
              topic.id === editingTopic.id
                ? { ...topic, name: name.trim(), color: color, icon: iconName }
                : topic
            )
          );
        }
      }

      setIsTopicDialogOpen(false);
      setEditingTopic(null);
    } catch (err) {
      console.error('Error managing topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to manage topic');
    }
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

  const handleDeleteDocument = async (documentId: string) => {
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
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  // Drag and Drop handlers
  const handleFileDrop = useCallback(async (documentId: string, targetTopicId: string | null) => {
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

  const handleTopicClick = (topic: Topic | null) => {
    setSelectedTopic(topic?.id || null);
  };

  const handleDocumentSelect = (id: string) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter((docId) => docId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };

  // Topic Grid Component
  const TopicGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {topics.map((topic) => {
          const IconComponent = PRESET_ICONS.find(i => i.name === topic.icon)?.icon || FolderIcon;
          return (
            <button
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className={`relative group overflow-hidden rounded-xl border border-white/10 
                transition-all duration-200 hover:border-white/20
                ${selectedTopic === topic.id ? 'bg-white/10' : 'bg-white/5'}`}
            >
              {/* Color Accent */}
              <div 
                className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-15"
                style={{ backgroundColor: topic.color }} 
              />
              
              <div className="relative p-4 flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: topic.color + '20' }}
                >
                  <IconComponent 
                    className="w-5 h-5"
                    style={{ color: topic.color }} 
                  />
                </div>
                
                <div>
                  <h3 className="text-white font-medium">{topic.name}</h3>
                  <p className="text-white/40 text-sm">
                    {topic.documents?.length || 0} {topic.documents?.length === 1 ? 'file' : 'files'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
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
          case 'docx':
            return ['doc', 'docx'].includes(extension);
          case 'txt':
            return extension === 'txt';
          case 'md':
            return extension === 'md';
          case 'other':
            return !['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension);
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
          case 'docx':
            return ['doc', 'docx'].includes(extension);
          case 'txt':
            return extension === 'txt';
          case 'md':
            return extension === 'md';
          case 'other':
            return !['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension);
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
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => handleBulkMove(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Move to...</option>
              <option value="null">Uncategorized</option>
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
          <FileItem
            key={document.id}
            document={document}
            isSelected={selectedFiles.includes(document.id)}
            onSelect={toggleFileSelection}
            onDownload={handleDownloadDocument}
            onRename={handleRenameFile}
            viewMode={viewMode}
          />
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
              <div className="h-[calc(100vh-240px)] max-h-[720px] flex flex-col">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-white/90">Documents</h1>
                    <p className="text-white/50 text-sm mt-1">Organize and manage your files</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsTopicDialogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 
                        text-purple-400/90 rounded-lg transition-all text-sm font-medium"
                    >
                      <PlusIcon className="w-4 h-4" />
                      New Topic
                    </button>
                    <button
                      onClick={() => {/* Add upload handler */}}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-purple-600/90 
                        hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all text-sm font-medium"
                    >
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      Upload Files
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex gap-6 min-h-0">
                  {/* Left Panel - Topics */}
                  <div className="w-80 flex flex-col bg-gradient-to-b from-white/[0.03] to-transparent 
                    rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-white/[0.06]">
                      <input
                        type="text"
                        placeholder="Search topics..."
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white/80 
                          placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                        value={topicsSearchQuery}
                        onChange={(e) => setTopicsSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                      <div className="space-y-1">
                        {/* All Documents Option */}
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg 
                            transition-all duration-200 group hover:bg-white/5
                            ${!selectedTopic ? 'bg-white/10' : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div 
                              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: 'rgb(147 51 234 / 0.2)' }}
                            >
                              <Squares2X2Icon 
                                className="w-4 h-4 text-purple-500"
                              />
                            </div>
                            <span className="font-medium">All Documents</span>
                            <span className="ml-auto text-xs opacity-60">
                              {documents.length}
                            </span>
                          </div>
                        </button>

                        {/* Topic List */}
                        {topics.map((topic) => {
                          const IconComponent = PRESET_ICONS.find(i => i.name === topic.icon)?.icon || FolderIcon;
                          return (
                            <button
                              key={topic.id}
                              onClick={() => setSelectedTopic(topic.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg 
                                transition-all duration-200 group hover:bg-white/5
                                ${selectedTopic === topic.id ? 'bg-white/10' : ''}`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div 
                                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: topic.color + '20' }}
                                >
                                  <IconComponent 
                                    className="w-4 h-4"
                                    style={{ color: topic.color }}
                                  />
                                </div>
                                <span className="font-medium truncate">{topic.name}</span>
                                <span className="ml-auto text-xs opacity-60">
                                  {topic.documents?.length || 0}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Documents */}
                  <div className="flex-1 flex flex-col bg-gradient-to-b from-white/[0.03] to-transparent 
                    rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                    {/* Toolbar */}
                    <div className="flex-shrink-0 p-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <DocumentsToolbar
                            searchQuery={selectedTopic ? searchQuery : uncategorizedSearchQuery}
                            onSearchChange={selectedTopic ? setSearchQuery : setUncategorizedSearchQuery}
                            sortBy={selectedTopic ? sortBy : uncategorizedSortBy}
                            onSortChange={selectedTopic ? setSortBy : setUncategorizedSortBy}
                            fileTypeFilter={selectedTopic ? fileTypeFilter : uncategorizedFileTypeFilter}
                            onFilterChange={selectedTopic ? setFileTypeFilter : setUncategorizedFileTypeFilter}
                          />
                        </div>
                        <div className="flex items-center gap-2 pl-4 border-l border-white/[0.06]">
                          <button
                            className={`p-2 rounded-lg hover:bg-white/[0.03] transition-colors
                              ${viewMode === 'grid' 
                                ? 'text-purple-400/90 bg-purple-500/20' 
                                : 'text-white/40 hover:text-white/60'}`}
                            onClick={() => setViewMode('grid')}
                          >
                            <Squares2X2Icon className="w-5 h-5" />
                          </button>
                          <button
                            className={`p-2 rounded-lg hover:bg-white/[0.03] transition-colors
                              ${viewMode === 'list' 
                                ? 'text-purple-400/90 bg-purple-500/20' 
                                : 'text-white/40 hover:text-white/60'}`}
                            onClick={() => setViewMode('list')}
                          >
                            <ListBulletIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Document List */}
                    <div className="flex-1 overflow-y-auto">
                      {isLoading ? (
                        // Loading State
                        <div className="h-full flex flex-col items-center justify-center text-white/40">
                          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-sm">Loading documents...</p>
                        </div>
                      ) : (selectedTopic ? topics.find(t => t.id === selectedTopic)?.documents : filteredAndSortedUncategorized)?.length === 0 ? (
                        // Empty State
                        <div className="h-full flex flex-col items-center justify-center text-white/40">
                          <DocumentIcon className="w-12 h-12 mb-3" />
                          <p className="text-sm mb-2">No documents found</p>
                          <button
                            onClick={() => {/* Add upload handler */}}
                            className="text-purple-400/90 hover:text-purple-400 text-sm transition-colors"
                          >
                            Upload your first document
                          </button>
                        </div>
                      ) : (
                        // Document Grid/List
                        <div className={viewMode === 'grid' 
                          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6" 
                          : "divide-y divide-white/[0.04]"
                        }>
                          {(selectedTopic ? topics.find(t => t.id === selectedTopic)?.documents : filteredAndSortedUncategorized)
                            ?.map((doc) => (
                              <FileItem
                                key={doc.id}
                                document={doc}
                                isSelected={selectedFiles.includes(doc.id)}
                                onSelect={toggleFileSelection}
                                onDownload={handleDownloadDocument}
                                onRename={handleRenameFile}
                                viewMode={viewMode}
                              />
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Files Actions */}
                    {selectedFiles.length > 0 && (
                      <div className="flex-shrink-0 p-4 bg-black/40 border-t border-white/[0.06] backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white/60">
                              {selectedFiles.length} file(s) selected
                            </span>
                            <button
                              onClick={() => setSelectedFiles([])}
                              className="text-sm text-purple-400/90 hover:text-purple-400 transition-colors"
                            >
                              Clear selection
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 
                                text-white/60 hover:text-white/80 transition-all text-sm"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              Download
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 
                                text-white/60 hover:text-white/80 transition-all text-sm"
                            >
                              <FolderPlusIcon className="w-4 h-4" />
                              Move to Topic
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 
                                text-red-400/90 hover:text-red-400 transition-all text-sm"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </PageTransition>
          </DisplayPanel>
        </div>

        <Notifications />
        <TopicDialog
          isOpen={isTopicDialogOpen}
          onClose={() => {
            setIsTopicDialogOpen(false);
            setEditingTopic(null);
          }}
          onSubmit={handleTopicSubmit}
          mode={topicDialogMode}
          initialName={editingTopic?.name}
          initialColor={editingTopic?.color}
          initialIcon={editingTopic?.icon}
          error={error}
        />
      </div>
    </DndProvider>
  );
}
