# Contributing to StudySync

## Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/studysync-new.git`
3. Install dependencies: `npm install`
4. Create a `.env.local` file based on `.env.example`
5. Start the development server: `npm run dev`

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style
- Use Tailwind CSS for styling
- Implement proper TypeScript types

### Component Guidelines
- Keep components focused and single-responsibility
- Use server components where possible
- Implement proper loading and error states
- Document component props with JSDoc

### Testing
- Write unit tests for utility functions
- Add component tests for critical UI elements
- Test error handling and edge cases

### Commit Messages
Follow conventional commits format:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

### Pull Requests
1. Create a feature branch
2. Make your changes
3. Update documentation
4. Create a pull request
5. Wait for review

## Project Structure
See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed project structure.
