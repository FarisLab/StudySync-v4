# Changelog

All notable changes to StudySync will be documented in this file.

## [Unreleased]

### Added
- Topic Icons
  - Added icon selection for topics using Heroicons
  - Predefined set of academic and general icons
  - Icon color matching with topic color
  - Visual consistency across UI
- Advanced document filtering and sorting system
  - Search functionality for topics and documents
  - Sort options for topics (name, date, file count)
  - Sort options for documents (name, date, size)
  - File type filtering (PDF, Word, Images, Others)
- Enhanced Upload Dialog
  - Improved aesthetics with stronger blur effect
  - Added colorful glow orbs in background
  - Better progress indicators
- Enhanced Topic Management System
  - New TopicDialog component with modern glassmorphic design
  - Color selection for topics with predefined color palette
  - Icon selection with academic-themed options
  - Improved topic creation and editing workflow
  - Document count display for each topic
  - Responsive and accessible dialog interface
- Bulk Actions
  - Select multiple documents
  - Move documents between topics
  - Delete multiple documents
- Comprehensive TypeScript type system
  - Added `document.types.ts` for document-related types
  - Added `user.types.ts` for user-related types
  - Added `api.types.ts` for API-related types
  - Consistent string-based IDs throughout the application
- Enhanced component type safety
  - Updated `UploadDialog` with proper type definitions
  - Updated `DocumentsToolbar` with improved type safety
  - Improved type consistency in document management
- Added JSDoc documentation to components
- Topic deletion feature with document handling
  - New DeleteTopicDialog component for confirming topic deletion
  - Documents in deleted topics are automatically moved to "Uncategorized"
  - Visual feedback and warnings when deleting topics with documents

### Changed
- Updated UI components to use glassmorphic design
- Improved document organization with topics instead of folders
- Enhanced toolbar layout and functionality
- Optimized search and filter performance with useMemo
- Migrated all ID types from numbers to strings for consistency
- Updated topic selection logic for better type safety

### Fixed
- Document sorting performance issues
- UI consistency across different sections
- Mobile responsiveness in document view
- Type mismatches in document management
- Topic selection and document assignment type safety
- TypeScript Improvements
  - Added missing path field to UploadResponse interface
  - Updated Topic interface to use UserDocument[] type
  - Fixed type safety in DeleteTopicDialog component
  - Improved document type filtering logic
  - Enhanced type definitions for file upload operations
  - Added proper type checking for document operations

## [1.0.0] - Initial Release

### Added
- User authentication with Supabase
- Basic document management
- Dashboard with activity tracking
- Dark mode optimization
- Responsive design
- File upload functionality
- Storage usage tracking
