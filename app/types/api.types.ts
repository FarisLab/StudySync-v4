/**
 * API-related types for StudySync
 */

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: 'success' | 'error';
    timestamp: Date;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface UploadResponse {
    fileId: string;
    url: string;
    path: string;
    size: number;
    type: string;
    uploadedAt: Date;
}

export interface SearchResponse {
    results: Array<{
        id: string;
        type: 'document' | 'folder';
        matchScore: number;
        highlights: string[];
    }>;
    totalResults: number;
    searchTime: number;
}
