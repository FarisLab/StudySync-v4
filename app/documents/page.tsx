'use client';

import { User } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { 
  PlusIcon,
  ArrowUpTrayIcon,
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
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

import { BaseDocument, DocumentType, DocumentSortType, ViewMode, DocumentMetadata, TopicIcon } from '../types/document.types';
import { Topic } from '@/app/types';
import { useDocumentManagement } from '../hooks/useDocumentManagement';
import { useTopicManagement } from '../hooks/useTopicManagement';
import { useFileUpload } from '../hooks/useFileUpload';
import { useStorage } from '../hooks/useStorage';
import RenameDialog from '../components/dialogs/RenameDialog';
import UploadDialog from '../components/dialogs/UploadDialog';
import SearchAndFilter from '../components/documents/SearchAndFilter';

import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import TopicList from '../components/documents/TopicList';
import DocumentList from '../components/documents/DocumentList';
import ViewModeToggle from '../components/documents/ViewModeToggle';
import TopicDialog from '../components/TopicDialog';

const supabase = createClientComponentClient();

interface IconOption {
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  name: string;
}

const PRESET_ICONS: IconOption[] = [
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
  const [mounted, setMounted] = useState(false);
  const [topicDialogMode, setTopicDialogMode] = useState<'create' | 'edit'>('create');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [error, setError] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [documentToRename, setDocumentToRename] = useState<BaseDocument | null>(null);

  // Topic Management
  const {
    topics,
    selectedTopic,
    setSelectedTopic,
    isCreatingTopic,
    setIsCreatingTopic,
    editingTopic,
    setEditingTopic,
    editingTopicId,
    setEditingTopicId,
    newName: topicName,
    setNewName: setTopicName,
    error: topicError,
    fetchTopics,
    handleCreateTopic,
    handleRenameTopic,
    handleDeleteTopic: deleteTopic,
    handleUpdateTopic,
    topicsSearchQuery,
    setTopicsSearchQuery,
    topicsSortBy,
    setTopicsSortBy,
  } = useTopicManagement();

  // Document Management
  const {
    documents,
    isLoading,
    error: documentError,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    fileTypeFilter,
    setFileTypeFilter,
    selectedDocuments,
    setSelectedDocuments,
    fetchDocuments,
    handleDeleteDocument,
    handleRenameDocument,
    handleMoveDocument,
    handleDownloadDocument,
  } = useDocumentManagement({ user, selectedTopic });

  // File Upload Management
  const { handleFileUpload, isUploading } = useFileUpload({
    user,
    onSuccess: () => {
      setIsUploadDialogOpen(false);
      fetchDocuments();
    },
    onError: (error) => {
      console.error('Upload error:', error);
      // You might want to show a toast or error message here
    },
    topicId: selectedTopic,
  });

  // Storage Management
  const { usedStorage, totalStorage, percentUsed } = useStorage();

  const handleDocumentUpload = async (files: FileList, metadata: DocumentMetadata): Promise<{ success: boolean }> => {
    const fileArray = Array.from(files);
    await handleFileUpload(fileArray, metadata);
    return { success: true };
  };

  const handleDocumentSelect = (id: string, event?: React.MouseEvent) => {
    const multiSelect = event?.ctrlKey || event?.metaKey;
    if (multiSelect) {
      setSelectedDocuments(prev => 
        prev.includes(id) 
          ? prev.filter(docId => docId !== id)
          : [...prev, id]
      );
    } else {
      setSelectedDocuments([id]);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication check
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          router.push('/auth');
          return;
        }
        setUser(currentUser);
        await fetchTopics(currentUser.id);
      } catch (err) {
        console.error('Error checking user:', err);
        router.push('/auth');
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, selectedTopic, fetchDocuments]);

  const handleTopicSubmit = async (name: string, color: string, icon: TopicIcon) => {
    if (!user) return;

    try {
      if (topicDialogMode === 'create') {
        await handleCreateTopic(user.id, { name, color, icon });
      } else {
        if (editingTopicId) {
          await handleUpdateTopic(editingTopicId, { name, color, icon });
        }
      }
      setIsCreatingTopic(false);
      setEditingTopic(null);
      setEditingTopicId(null);
    } catch (error) {
      console.error('Failed to handle topic:', error);
      setError(error instanceof Error ? error.message : 'Failed to handle topic');
    }
  };

  const handleTopicClick = (topicId: string | null) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
  };

  const startEditingTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setEditingTopicId(topic.id);
    setTopicName(topic.name);
    setTopicDialogMode('edit');
    setIsCreatingTopic(true);
  };

  const handleDeleteTopicConfirm = async (topicId: string) => {
    try {
      await deleteTopic(topicId);
      setEditingTopic(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting topic:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
    }
  };

  const getFilteredAndSortedDocuments = useCallback(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(doc => {
        const extension = doc.name.split('.').pop()?.toLowerCase();
        switch (fileTypeFilter) {
          case 'pdf':
            return extension === 'pdf';
          case 'doc':
            return extension === 'doc' || extension === 'docx';
          case 'txt':
            return extension === 'txt';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, fileTypeFilter, sortBy]);

  const filteredAndSortedDocuments = getFilteredAndSortedDocuments();

  const handleDocumentDelete = async (document: BaseDocument) => {
    const result = await handleDeleteDocument(document);
    if (!result.success) {
      // You might want to show a toast or error message here
      console.error('Failed to delete document:', result.error);
    }
  };

  const handleDocumentRename = async (document: BaseDocument, newName: string) => {
    const result = await handleRenameDocument(document, newName);
    if (!result.success) {
      // You might want to show a toast or error message here
      console.error('Failed to rename document:', result.error);
    }
  };

  const handleDocumentDownload = async (document: BaseDocument) => {
    const result = await handleDownloadDocument(document);
    if (!result.success) {
      // You might want to show a toast or error message here
      console.error('Failed to download document:', result.error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      
      {/* Content */}
      <div className="relative">
        <Sidebar />
        <DisplayPanel>
          <PageTransition>
            <DndProvider backend={HTML5Backend}>
              <div className="flex h-screen">
                {/* Left Panel - Topics */}
                <div className="w-72 p-6 border-r border-white/10 flex flex-col h-full">
                  {/* Topics Section */}
                  <div className="flex-1 flex flex-col min-h-0 mb-16">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Topics</h2>
                      <button
                        onClick={() => setIsCreatingTopic(true)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-5 h-5 text-white/60" />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <TopicList
                        topics={topics}
                        documents={documents}
                        selectedTopic={selectedTopic}
                        topicsSearchQuery={topicsSearchQuery}
                        setTopicsSearchQuery={setTopicsSearchQuery}
                        onTopicSelect={handleTopicClick}
                        startEditingTopic={startEditingTopic}
                        onCreateTopic={() => setIsCreatingTopic(true)}
                      />
                    </div>
                  </div>

                  {/* Storage Section */}
                  <div className="flex-none mb-8 pt-6 border-t border-white/10">
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-white/60 mb-2">Storage</h3>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400" 
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">{usedStorage} used</span>
                      <span className="text-white/40">{totalStorage} total</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Documents */}
                <div className="flex-1 p-6 flex flex-col h-full">
                  {/* Header with Search, Filters, and Actions */}
                  <div className="flex-none mb-6">
                    {/* Search, Filters and Actions Row */}
                    <div className="flex items-center gap-3">
                      <SearchAndFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={(value) => setSortBy(value as DocumentSortType)}
                        fileTypeFilter={fileTypeFilter}
                        onFilterChange={(value) => setFileTypeFilter(value)}
                      />
                      <button
                        onClick={() => setIsUploadDialogOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/90 hover:bg-purple-500 
                          backdrop-blur-md text-white rounded-xl transition-all flex-shrink-0"
                      >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        <span>Upload</span>
                      </button>
                      <ViewModeToggle
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                      />
                    </div>
                  </div>

                  {/* Document List */}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <DocumentList
                      documents={filteredAndSortedDocuments}
                      viewMode={viewMode}
                      selectedDocuments={selectedDocuments}
                      onDocumentSelect={handleDocumentSelect}
                      onDocumentClick={(doc) => console.log('clicked doc:', doc)}
                      onDownload={handleDocumentDownload}
                      onRename={(doc) => setDocumentToRename(doc)}
                      onDelete={handleDocumentDelete}
                      onUpload={() => setIsUploadDialogOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </DndProvider>
          </PageTransition>
        </DisplayPanel>
      </div>

      {/* Topic Dialog */}
      <TopicDialog
        isOpen={isCreatingTopic}
        onClose={() => {
          setIsCreatingTopic(false);
          setEditingTopic(null);
          setEditingTopicId(null);
        }}
        mode={topicDialogMode}
        initialName={editingTopic?.name || ''}
        initialColor={editingTopic?.color || '#6366F1'}
        initialIcon={editingTopic?.icon || 'Folder'}
        onSubmit={handleTopicSubmit}
        onDelete={editingTopic ? () => handleDeleteTopicConfirm(editingTopic.id) : undefined}
        hasDocuments={editingTopic ? documents.some(doc => doc.topic_id === editingTopic.id) : false}
      />

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleDocumentUpload}
        selectedTopic={selectedTopic}
      />

      {documentToRename && (
        <RenameDialog
          document={documentToRename}
          isOpen={true}
          onClose={() => setDocumentToRename(null)}
          onRename={handleDocumentRename}
        />
      )}
    </div>
  );
}
