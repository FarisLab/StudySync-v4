export interface Topic {
  id: string;
  name: string;
  color: string;
  icon: TopicIcon;
  user_id: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  name: string;
  user_id: string;
  topic_id?: string;
  created_at: string;
  updated_at: string;
  size: number;
  type: string;
  url: string;
  storage_path: string;
  topic?: Topic;
}

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'other';

export type ViewMode = 'list' | 'grid';

export interface TopicDocument {
  topic_id: string;
  document_id: string;
}

export interface DocumentMetadata {
  topic_id?: string;
  name?: string;
  type?: string;
  size?: number;
  pageCount?: number;
  author?: string;
  creationDate?: Date;
  lastModified?: Date;
  keywords?: string[];
}

export interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  fileName: string;
  name: string;
}

export interface UploadResponse {
  path: string;
  url: string;
  fileId: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface UserDocument {
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

export type TopicIcon = 'Folder' | 'Book' | 'Academic' | 'Science' | 'Math' | 'Code' | 'Notes' | 'Geography' | 'Music' | 'Art' | 'Games' | 'Physics' | 'Magic';
