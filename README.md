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

- 📂 **Document Management**
  - Upload and organize documents
  - Create topics and categories
  - Advanced filtering and sorting
  - File type categorization
  - Search functionality
  - Bulk actions support
  - Rename and delete functionality
  - Storage usage tracking

- 🎯 **Dashboard**
  - Quick overview of documents
  - Recent activity tracking
  - Storage usage visualization
  - Quick action buttons
  - Topic management
  - Document filtering and sorting

## Tech Stack

- **Frontend Framework**: Next.js 13+ (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons

## Getting Started

1. **Clone and Install**
   ```bash
   git clone [your-repo-url]
   cd studysync-new
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
studysync-new/
├── app/
│   ├── auth/                 # Authentication pages
│   ├── dashboard/           # Dashboard and document management
│   ├── components/          # Reusable components
│   │   ├── DisplayPanel.tsx
│   │   ├── PageTransition.tsx
│   │   └── Sidebar.tsx
│   └── lib/                # Utility functions and configs
├── public/                 # Static assets
└── ...config files
```

## Key Components

- **DisplayPanel**: Main content wrapper with responsive behavior
- **Sidebar**: Navigation component with authentication state
- **PageTransition**: Smooth page transition animations
- **Auth Pages**: Complete authentication flow with error handling

## Styling

The project uses a custom design system with:
- Glassmorphic UI elements
- Purple accent colors
- Custom animated backgrounds
- Responsive grid layouts
- Dark mode optimization

## Contributing

Feel free to contribute to this project. Open an issue or submit a pull request.

## License

MIT License - feel free to use this project for your own purposes.
