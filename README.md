# StudySync

A modern document management system built with Next.js 13+, Supabase, and Tailwind CSS.

## Features

- 🔐 **Secure Authentication**
  - Email/Password authentication with Supabase
  - Protected routes and middleware
  - Seamless sign-up and sign-in experience

- 📱 **Modern UI/UX**
  - Responsive glassmorphic design
  - Smooth animations with Framer Motion
  - Custom animated backgrounds
  - Dark mode optimized interface
  - Academic-themed icons for topics

- 📂 **Document Management**
  - Upload and organize documents
    - Drag-and-drop file uploads
    - Progress tracking
    - File type validation
    - Size limit enforcement (50MB)
    - Error handling and feedback
    - Topic association
  - Create topics with custom colors and icons
  - Edit and delete topics with document handling
  - Advanced filtering and sorting
  - File type categorization
  - Search functionality
  - Document Selection
    - Click to toggle selection state
    - Multi-select support
    - Bulk actions on selected documents
      - Move to topic
      - Download as zip
      - Delete
  - Rename and delete functionality
  - Storage usage tracking

- 🎯 **Dashboard**
  - Quick overview of documents
  - Recent activity tracking
  - Storage usage visualization
  - Quick action buttons
  - Visual topic management with icons
  - Document filtering and sorting

- 🔍 **Type Safety**
  - Comprehensive TypeScript integration
  - Strict type checking enabled
  - Consistent string-based IDs
  - Type-safe API interactions
  - Well-documented interfaces

## Tech Stack

- **Frontend Framework**: Next.js 13+ (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **File Storage**: Supabase Storage
- **Type System**: TypeScript
- **Icons**: Heroicons

## Development Standards

### Code Organization

- Next.js 13+ App Router directory structure
- Modular component architecture
- Clear client/server component separation
- PascalCase for components, camelCase for utilities

### TypeScript Standards

- Strict type checking enabled
- No `any` types unless necessary
- Interface definitions in `.types.ts` files
- Type-safe API interactions

### Component Guidelines

- Single responsibility principle
- Custom hooks for reusable logic
- Proper prop validation
- Documented component APIs

### State Management

- React hooks for local state
- Loading and error states
- Null checks and edge cases
- Documented state patterns

### Styling

- Tailwind CSS with project conventions
- Purple accent color scheme
- Glassmorphic design patterns
- Responsive design principles

### Security

- No sensitive data in client code
- Authentication checks
- Input validation
- Secure file handling

### Testing

- Unit tests for utilities
- Component testing
- Auth flow integration tests
- E2E tests for critical paths

### Documentation

- JSDoc comments
- Updated README.md
- Maintained CHANGELOG.md
- Environment setup docs

### Error Handling

- Consistent error messages
- Error boundaries
- User-friendly states
- Debug logging

### File Upload Rules

- Maximum file size: 50MB
- Supported file types:
  - Documents: PDF, DOC, DOCX, XLS, XLSX
  - Images: PNG, JPG, JPEG, GIF
- Drag-and-drop support
- Progress tracking
- Error handling
  - Size validation
  - Type validation
  - Upload errors
- Topic association
  - Files can be uploaded directly to topics
  - Topic can be selected during upload
- Bulk upload support
  - Multiple files can be uploaded simultaneously
  - Individual progress tracking per file
  - Aggregate upload status

### Accessibility

- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/studysync-new.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials.

4. Run the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before making a contribution.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
