export interface Topic {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  documents?: Document[];
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  topic_id: string | null;
  topic?: Topic | null;
  created_at?: string;
  updated_at?: string;
  url?: string;
}

export interface TopicDocument {
  topic_id: string;
  document_id: string;
}

export interface DocumentMetadata {
  name: string;
  type: string;
  size: number;
}

export interface UploadProgress {
  progress: number;
  name: string;
}

export interface UploadResponse {
  path: string;
  url: string;
}
