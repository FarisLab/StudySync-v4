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

import { Document } from '@/app/types';
import { BaseDocument, DocumentType, DocumentSortType, ViewMode, DocumentMetadata, TopicIcon } from '../types/document.types';
import { Topic } from '@/app/types';
import { useDocumentManagement } from '../hooks/useDocumentManagement';
import { useTopicManagement } from '../hooks/useTopicManagement';
import { useFileUpload } from '../hooks/useFileUpload';
import { useStorage } from '../hooks/useStorage';
import RenameDialog from '../components/dialogs/RenameDialog';
import UploadDialog from '../components/dialogs/UploadDialog';
import SearchAndFilter from '../components/documents/SearchAndFilter';
import DeleteConfirmationDialog from '../components/dialogs/DeleteConfirmationDialog';
import Toast from '../components/Toast';

import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import TopicList from '../components/documents/TopicList';
import DocumentList from '../components/documents/DocumentList';
import ViewModeToggle from '../components/documents/ViewModeToggle';
import TopicDialog from '../components/TopicDialog';
import { MultiDocumentActions } from '@/app/components/documents/MultiDocumentActions';

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

interface UploadResponse {
  success: boolean;
  error?: string;
}

export default function Documents() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [topicDialogMode, setTopicDialogMode] = useState<'create' | 'edit'>('create');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [error, setError] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [documentToRename, setDocumentToRename] = useState<BaseDocument | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [documentsToDelete, setDocumentsToDelete] = useState<BaseDocument[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

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
    filteredDocuments,
    filteredAndSortedDocuments,
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
    downloadSelectedDocuments,
    isDownloading,
    handleDeleteDocument,
    handleRenameDocument,
    handleMoveDocument,
    handleDownloadDocument,
    handleMultipleDocumentsMove,
    handleMultipleDocumentsDelete,
    handleDocumentSelect: handleDocumentSelectHook,
    fetchDocuments,
  } = useDocumentManagement({ user, selectedTopic });

  // File Upload Management
  const { handleFileUpload, isUploading } = useFileUpload({
    user,
    topicId: selectedTopic
  });

  // Storage Management
  const [usedStorage, setUsedStorage] = useState(0);
  const [totalStorage] = useState(10 * 1024 * 1024 * 1024); // 10GB
  const [percentUsed, setPercentUsed] = useState(0);

  // Calculate storage usage
  useEffect(() => {
    const calculateStorage = async () => {
      try {
        const totalBytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);
        setUsedStorage(totalBytes);
        setPercentUsed(Math.min((totalBytes / totalStorage) * 100, 100));
      } catch (error) {
        console.error('Error calculating storage:', error);
        setUsedStorage(0);
        setPercentUsed(0);
      }
    };

    calculateStorage();
  }, [documents, totalStorage]);

  const handleDocumentUpload = async (files: File[], metadata: DocumentMetadata): Promise<UploadResponse> => {
    try {
      console.log('Starting file upload...');
      const response = await handleFileUpload(files, metadata);
      console.log('Upload response:', response);
      
      if (response.success) {
        setToast({
          show: true,
          message: 'Files uploaded successfully',
          type: 'success'
        });
        fetchDocuments();
      }
      
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      const errorResponse: UploadResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload files'
      };
      
      setToast({
        show: true,
        message: errorResponse.error || 'Failed to upload files',
        type: 'error'
      });
      
      return errorResponse;
    }
  };

  const handleTopicSubmit = async (name: string, color: string, icon: TopicIcon) => {
    if (!user) return;
    
    try {
      if (topicDialogMode === 'create') {
        const newTopic = await handleCreateTopic(user.id, { name, color, icon });
        // No need to fetch topics since handleCreateTopic already updated the state with complete data
      } else if (editingTopicId) {
        await handleUpdateTopic(editingTopicId, { name, color, icon });
        await fetchTopics(user.id); // Still need to refresh for updates
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDocumentDownloadWrapper = async (document: BaseDocument): Promise<void> => {
    await handleDownloadDocument(document);
  };

  const handleDocumentRenameWrapper = async (document: BaseDocument, newName: string): Promise<void> => {
    await handleRenameDocument(document, newName);
  };

  const handleDocumentDeleteWrapper = async (document: BaseDocument): Promise<void> => {
    await handleDeleteDocument(document);
  };

  const handleMultipleDocumentsDeleteWrapper = () => {
    handleMultipleDocumentsDelete(documentsToDelete);
  };

  const handleDocumentClick = (document: BaseDocument) => {
    // Handle document click action
    console.log('Document clicked:', document);
  };

  const handleStartRenaming = (document: BaseDocument) => {
    setDocumentToRename(document);
  };

  const handleStartDeleting = (document: BaseDocument) => {
    setDocumentsToDelete([document]);
    setIsDeleteConfirmationOpen(true);
  };

  const handleStartUpload = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCreateTopicClick = () => {
    setIsCreatingTopic(true);
  };

  const handleDownloadWrapper = async (document: BaseDocument): Promise<void> => {
    await handleDownloadDocument(document);
  };

  const handleMoveDocuments = async (documents: BaseDocument[], topicId: string | null) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ topic_id: topicId })
        .in('id', documents.map(doc => doc.id));

      if (error) throw error;

      // Update local state
      fetchDocuments();

      // Clear selection after move
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error moving documents:', error);
      // TODO: Show error toast
    }
  };

  const handleDocumentSelect = (documentId: string, event?: React.MouseEvent) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    setSelectedDocuments(prev => {
      // If document is already selected, remove it from selection
      if (prev.some(d => d.id === documentId)) {
        return prev.filter(d => d.id !== documentId);
      }
      // Add document to selection
      return [...prev, document];
    });
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

  // Fetch documents only when user changes
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

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
                <div className="w-80 py-6 px-5 border-r border-white/10 flex flex-col h-full">
                  {/* Topics Section */}
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-semibold text-white/90">Topics</h2>
                      <button
                        onClick={() => setIsCreatingTopic(true)}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" />
                      </button>
                    </div>
                    <div className="flex-grow overflow-y-auto mb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                      <TopicList
                        topics={topics}
                        documents={documents}
                        selectedTopic={selectedTopic}
                        topicsSearchQuery={topicsSearchQuery}
                        setTopicsSearchQuery={setTopicsSearchQuery}
                        onTopicSelect={handleTopicClick}
                        startEditingTopic={startEditingTopic}
                        onCreateTopic={handleCreateTopicClick}
                        onMoveToTopic={handleMultipleDocumentsMove}
                        storageStats={{
                          used: usedStorage,
                          total: totalStorage,
                          percentage: percentUsed
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Panel - Documents */}
                <div className="flex-1 py-6 px-5 overflow-hidden">
                  {/* Documents Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-white/90">Documents</h2>
                  </div>

                  {/* Search and actions bar */}
                  <div className="flex-none mb-6">
                    <div className="flex items-center justify-between gap-4">
                      <SearchAndFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        fileTypeFilter={fileTypeFilter}
                        onFilterChange={setFileTypeFilter}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsUploadDialogOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
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
                  </div>

                  {/* Document List Container */}
                  <div className="h-[calc(100vh-25rem)] overflow-hidden pb-4 relative">
                    {filteredAndSortedDocuments.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center h-full">
                        <div className="flex flex-col items-center p-8 bg-white/[0.02] rounded-2xl backdrop-blur-sm border border-white/[0.05] max-w-sm">
                          <div className="w-12 h-12 mb-5 text-white/25">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-white/90 mb-1.5">No documents found</h3>
                          <p className="text-sm text-white/50 text-center mb-6">Upload some documents or try a different search</p>
                          <button
                            onClick={() => setIsUploadDialogOpen(true)}
                            className="inline-flex items-center px-4 h-9 bg-purple-600/90 hover:bg-purple-600 transition-colors rounded-lg text-sm text-white/90 font-medium"
                          >
                            <svg className="w-4 h-4 mr-2 -ml-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Upload Document
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full">
                        <DocumentList
                          documents={filteredAndSortedDocuments}
                          viewMode={viewMode}
                          selectedDocuments={selectedDocuments}
                          onDocumentSelect={handleDocumentSelect}
                          onDocumentClick={handleDocumentClick}
                          onDownload={handleDownloadWrapper}
                          onRename={handleStartRenaming}
                          onDelete={handleStartDeleting}
                          onUpload={handleStartUpload}
                          downloadSelectedDocumentsAction={downloadSelectedDocuments}
                          isDownloading={isDownloading}
                          setSelectedDocumentsAction={setSelectedDocuments}
                          onMoveToTopicAction={handleMoveDocuments}
                          onBatchDeleteAction={handleMultipleDocumentsDelete}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DndProvider>

            {/* Multi-document actions */}
            <MultiDocumentActions
              selectedDocuments={selectedDocuments}
              setSelectedDocumentsAction={setSelectedDocuments}
              downloadSelectedDocumentsAction={downloadSelectedDocuments}
              isDownloading={isDownloading}
              onMoveToTopicAction={handleMoveDocuments}
              onDeleteAction={handleMultipleDocumentsDelete}
            />
          </PageTransition>
        </DisplayPanel>
      </div>

      {/* Topic Dialog */}
      <TopicDialog
        isOpen={isCreatingTopic}
        onCloseAction={() => {
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
        onCloseAction={() => setIsUploadDialogOpen(false)}
        onUpload={handleDocumentUpload}
        selectedTopic={selectedTopic}
      />

      {documentToRename && (
        <RenameDialog
          document={documentToRename}
          isOpen={true}
          onCloseAction={() => setDocumentToRename(null)}
          onRename={handleDocumentRenameWrapper}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onCloseAction={() => setIsDeleteConfirmationOpen(false)}
        onConfirmAction={handleMultipleDocumentsDeleteWrapper}
        title="Delete Documents"
        message={`Are you sure you want to delete ${documentsToDelete.length} documents? This action cannot be undone.`}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onCloseAction={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
