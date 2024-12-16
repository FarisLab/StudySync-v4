/**
 * Core document types for StudySync
 */

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'other';

export type DocumentSortType = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'size-asc' | 'size-desc';

export type ViewMode = 'list' | 'grid';

export type TopicIcon = 'Folder' | 'Book' | 'Academic' | 'Science' | 'Math' | 'Code' | 'Notes' | 'Geography' | 'Music' | 'Art' | 'Games' | 'Physics' | 'Magic';

export interface BaseDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  storage_path: string;
  url?: string;
  topic_id?: string | undefined;
  topic?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
}

export interface UserDocument extends BaseDocument {
  topic_id?: string | undefined;
}

export interface Topic {
  id: string;
  name: string;
  color: string;
  icon: TopicIcon;
  user_id: string;
  created_at: string;
  documents?: UserDocument[];
}

export interface DocumentMetadata {
  topic_id?: string | undefined;
  pageCount?: number;
  author?: string;
  creationDate?: Date;
  lastModified?: Date;
  keywords?: string[];
}

export interface DocumentPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export interface DocumentStats {
  viewCount: number;
  downloadCount: number;
  lastViewed?: Date;
  lastDownloaded?: Date;
}

export interface DocumentFilter {
  searchTerm?: string;
  type?: DocumentType[];
  category?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  ownerId?: string;
  isPublic?: boolean;
}

export interface DocumentSortOptions {
  field: 'name' | 'size' | 'createdAt' | 'updatedAt' | 'viewCount';
  direction: 'asc' | 'desc';
}

export interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  fileName: string;
}

export interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface TopicDocument {
  topic_id: string;
  document_id: string;
  created_at: string;
}

export interface UploadResponse {
  success: boolean;
  error?: string;
  progress?: UploadProgress[];
}

export interface Document extends BaseDocument {
  topic_id?: string | undefined;
}
