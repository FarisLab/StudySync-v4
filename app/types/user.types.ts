/**
 * User-related types for StudySync
 */

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    createdAt: Date;
    lastLogin?: Date;
    preferences: UserPreferences;
    storageUsed: number;
    storageLimit: number;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'grid' | 'list';
    notificationsEnabled: boolean;
    emailNotifications: EmailNotificationSettings;
}

export interface EmailNotificationSettings {
    documentShared: boolean;
    documentUpdated: boolean;
    storageWarning: boolean;
    weeklyDigest: boolean;
}

export interface UserStats {
    totalDocuments: number;
    totalStorage: number;
    documentsShared: number;
    lastUpload?: Date;
}

export interface UserSession {
    userId: string;
    token: string;
    expiresAt: Date;
    lastActivity: Date;
}
