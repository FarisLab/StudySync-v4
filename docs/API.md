# StudySync API Documentation

## Context APIs

### DocumentOperationsContext
Manages document operations and provides visual feedback for operations.

```typescript
interface DocumentOperationsContextType {
  moveProgress: MoveProgress | null;
  startMoveProgress: (sourceTopicId: string | null, targetTopicId: string | null) => Promise<void>;
}

interface MoveProgress {
  sourceTopicId: string | null;
  targetTopicId: string | null;
  progress: number;
  isCompleted?: boolean;
}
```

## Custom Hooks

### useDocumentManagement
```typescript
interface UseDocumentManagementProps {
  user: User | null;
  selectedTopic: string | null;
}

interface UseDocumentManagementReturn {
  documents: BaseDocument[];
  filteredDocuments: BaseDocument[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: DocumentSortType;
  setSortBy: (sort: DocumentSortType) => void;
  fileTypeFilter: DocumentType | 'all';
  setFileTypeFilter: (filter: DocumentType | 'all') => void;
  selectedDocuments: BaseDocument[];
  setSelectedDocuments: (docs: BaseDocument[]) => void;
  handleDeleteDocument: (doc: BaseDocument) => Promise<void>;
  handleRenameDocument: (doc: BaseDocument, newName: string) => Promise<void>;
  handleMoveDocument: (doc: BaseDocument, topicId: string | null) => Promise<void>;
  handleDownloadDocument: (doc: BaseDocument) => Promise<void>;
  fetchDocuments: () => Promise<void>;
}
```

### useTopicManagement
```typescript
interface UseTopicManagementReturn {
  topics: Topic[];
  selectedTopic: string | null;
  setSelectedTopic: (id: string | null) => void;
  isCreatingTopic: boolean;
  setIsCreatingTopic: (creating: boolean) => void;
  editingTopic: Topic | null;
  setEditingTopic: (topic: Topic | null) => void;
  error: string | null;
  topicsSearchQuery: string;
  setTopicsSearchQuery: (query: string) => void;
  handleCreateTopic: (userId: string, data: Partial<Topic>) => Promise<Topic>;
  handleUpdateTopic: (topicId: string, updates: Partial<Topic>) => Promise<Topic>;
  handleDeleteTopic: (topicId: string) => Promise<void>;
  fetchTopics: (userId: string) => Promise<void>;
}
```

### useFileUpload
```typescript
interface UseFileUploadProps {
  user: User | null;
  topicId: string | null;
}

interface UseFileUploadReturn {
  handleFileUpload: (files: File[], metadata: DocumentMetadata) => Promise<UploadResponse>;
  isUploading: boolean;
}
```

### useStorage
```typescript
interface UseStorageReturn {
  usedStorage: number;
  totalStorage: number;
  percentUsed: number;
  formatBytes: (bytes: number) => string;
}
```

## Component APIs

### ProgressRing
```typescript
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}
```

### TopicDialog
```typescript
interface TopicDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  mode: 'create' | 'edit';
  initialName?: string;
  initialColor?: string;
  initialIcon?: TopicIcon;
  onSubmit: (name: string, color: string, icon: TopicIcon) => void;
  onDelete?: () => void;
  hasDocuments?: boolean;
}
```

### DocumentList
```typescript
interface DocumentListProps {
  documents: BaseDocument[];
  viewMode: ViewMode;
  selectedDocuments: BaseDocument[];
  onDocumentSelect: (id: string, event: React.MouseEvent, isCtrl: boolean) => void;
  onDocumentClick: (doc: BaseDocument) => void;
  onDownload: (doc: BaseDocument) => Promise<void>;
  onRename: (doc: BaseDocument) => void;
  onDelete: (doc: BaseDocument) => Promise<void>;
  onUpload?: () => void;
  isDownloading: boolean;
}
```

### TopicList
```typescript
interface TopicListProps {
  topics: Topic[];
  documents: BaseDocument[];
  selectedTopic: string | null;
  topicsSearchQuery: string;
  setTopicsSearchQuery: (query: string) => void;
  onTopicSelect: (topicId: string | null) => void;
  startEditingTopic: (topic: Topic) => void;
  onCreateTopic: () => void;
  onMoveToTopic: (docs: BaseDocument[], topicId: string | null) => Promise<void>;
  storageStats: StorageStats;
}
```

## Type Definitions

### Document Types
```typescript
interface BaseDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  created_at: string;
  updated_at: string;
  topic_id: string | null;
  user_id: string;
  storage_path: string;
}

type DocumentType = 'pdf' | 'doc' | 'docx' | 'txt' | 'image' | 'other';
type DocumentSortType = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'size-asc' | 'size-desc';
type ViewMode = 'grid' | 'list';
```

### Topic Types
```typescript
interface Topic {
  id: string;
  name: string;
  color: string;
  icon: TopicIcon;
  user_id: string;
  created_at: string;
  documents?: BaseDocument[];
}

type TopicIcon = 'Folder' | 'Book' | 'Academic' | 'Science' | 'Math' | 'Code' | 'Notes' | 
  'Geography' | 'Music' | 'Art' | 'Games' | 'Physics' | 'Magic';
```

## Animation Configuration
```typescript
const MOVE_ANIMATION_CONFIG = {
  STEPS: 10,
  INITIAL_DELAY: 200,
  STEP_DURATION: 100,
  COMPLETION_DURATION: 600,
  FINAL_DELAY: 200,
} as const;
