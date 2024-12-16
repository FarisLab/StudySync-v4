'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/react';
import { 
  XMarkIcon,
  FolderIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  CalculatorIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Topic, TopicIcon } from '@/app/types/document.types';
import DeleteConfirmationDialog from './dialogs/DeleteConfirmationDialog'; // Assuming DeleteConfirmationDialog is in the same directory

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
];

const PRESET_ICONS: { icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>; name: TopicIcon }[] = [
  { icon: FolderIcon, name: 'Folder' },
  { icon: BookOpenIcon, name: 'Book' },
  { icon: AcademicCapIcon, name: 'Academic' },
  { icon: BeakerIcon, name: 'Science' },
  { icon: CalculatorIcon, name: 'Math' },
  { icon: CodeBracketIcon, name: 'Code' },
  { icon: DocumentTextIcon, name: 'Notes' },
  { icon: GlobeAltIcon, name: 'Geography' },
  { icon: MusicalNoteIcon, name: 'Music' },
  { icon: PaintBrushIcon, name: 'Art' },
  { icon: PuzzlePieceIcon, name: 'Games' },
  { icon: RocketLaunchIcon, name: 'Physics' },
  { icon: SparklesIcon, name: 'Magic' },
];

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

/**
 * TopicDialog Component
 * 
 * A modal dialog component for creating and editing topics in the StudySync application.
 * Features a modern glassmorphic design with color selection and accessibility support.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls the visibility of the dialog
 * @param {() => void} props.onCloseAction - Callback function when the dialog is closed
 * @param {'create' | 'edit'} props.mode - Dialog mode: 'create' for new topics, 'edit' for existing ones
 * @param {string} [props.initialName] - Initial topic name (for edit mode)
 * @param {string} [props.initialColor] - Initial topic color (for edit mode)
 * @param {TopicIcon} [props.initialIcon] - Initial topic icon (for edit mode)
 * @param {(name: string, color: string, icon: TopicIcon) => void} props.onSubmit - Callback function when form is submitted
 * @param {() => void} [props.onDelete] - Callback function when delete button is clicked (for edit mode)
 * @param {boolean} [props.hasDocuments] - Whether the topic has documents (for edit mode)
 */
const TopicDialog: React.FC<TopicDialogProps> = ({
  isOpen,
  onCloseAction,
  mode,
  initialName = '',
  initialColor = '#6366F1',
  initialIcon = 'Folder',
  onSubmit,
  onDelete,
  hasDocuments = false,
}) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for focus management
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Memoize icon and color options to prevent unnecessary re-renders
  const iconOptions = useMemo(() => PRESET_ICONS, []);
  const colorOptions = useMemo(() => PRESET_COLORS, []);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the initial element (name input in create mode, or first button in delete confirm)
      if (!showDeleteConfirm && initialFocusRef.current) {
        initialFocusRef.current.focus();
      }
    } else {
      // Restore focus when dialog closes
      previousActiveElement.current?.focus();
    }
  }, [isOpen, showDeleteConfirm]);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setColor(initialColor);
      setSelectedIcon(initialIcon);
      setShowDeleteConfirm(false);
      setError(null);
    } else {
      // Reset form state when dialog closes
      setName('');
      setColor('#6366F1');
      setSelectedIcon('Folder');
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [isOpen, initialName, initialColor, initialIcon]);

  // Form validation
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Topic name is required';
    }
    if (name.length > 50) {
      return 'Topic name must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
      return 'Topic name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(name.trim(), color, selectedIcon);
      onCloseAction();
    } catch (err) {
      setError('Failed to save topic. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        setIsSubmitting(true);
        await onDelete();
        onCloseAction();
      } catch (err) {
        setError('Failed to delete topic. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <Dialog 
      open={isOpen} 
      onClose={onCloseAction} 
      className="relative z-50"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Background overlay with animation */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel 
          as="div"
          className={`w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-lg p-6 shadow-xl transition-all duration-300 border border-white/10
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className={`transition-opacity duration-300 ${showDeleteConfirm ? 'opacity-0 absolute' : 'opacity-100 relative'}`}>
            <DialogTitle id="dialog-title" className="text-xl font-semibold text-white mb-1">
              {mode === 'create' ? 'Create New Topic' : 'Edit Topic'}
            </DialogTitle>
            <DialogDescription id="dialog-description" className="text-sm text-zinc-400 mb-6">
              {mode === 'create' 
                ? 'Create a new topic to organize your documents'
                : 'Update your topic settings'}
            </DialogDescription>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Topic Name Input */}
              <div>
                <label htmlFor="topic-name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Topic Name
                </label>
                <div className="relative">
                  <input
                    ref={initialFocusRef}
                    id="topic-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) {
                        const validationError = validateName(e.target.value);
                        setError(validationError);
                      }
                    }}
                    onBlur={() => {
                      const validationError = validateName(name);
                      setError(validationError);
                    }}
                    maxLength={50}
                    placeholder="Enter topic name"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'name-error' : 'name-hint'}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg 
                      text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                      focus:ring-purple-500/50 focus:border-purple-500/50 transition-all
                      pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    {name.length}/50
                  </span>
                </div>
                {error ? (
                  <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">
                    {error}
                  </p>
                ) : (
                  <p id="name-hint" className="mt-1 text-xs text-zinc-500">
                    Use letters, numbers, spaces, hyphens, and underscores only
                  </p>
                )}
              </div>

              {/* Icon Selection */}
              <div role="radiogroup" aria-label="Topic Icon">
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Topic Icon
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {iconOptions.map(({ icon: Icon, name: iconName }, index) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedIcon(iconName);
                        }
                        // Handle arrow key navigation
                        const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
                        if (!buttons) return;
                        
                        let nextIndex = index;
                        if (e.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
                        else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
                        else if (e.key === 'ArrowUp') nextIndex = (index - 7 + buttons.length) % buttons.length;
                        else if (e.key === 'ArrowDown') nextIndex = (index + 7) % buttons.length;
                        else return;

                        e.preventDefault();
                        (buttons[nextIndex] as HTMLButtonElement).focus();
                      }}
                      aria-label={`Select ${iconName} icon`}
                      aria-pressed={selectedIcon === iconName}
                      className={`p-2 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-purple-500/50
                        ${selectedIcon === iconName 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div role="radiogroup" aria-label="Topic Color">
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Topic Color
                </label>
                <div className="grid grid-cols-8 gap-3">
                  {colorOptions.map((c, index) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setColor(c);
                        }
                        // Handle arrow key navigation
                        const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
                        if (!buttons) return;
                        
                        let nextIndex = index;
                        if (e.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
                        else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
                        else if (e.key === 'ArrowUp') nextIndex = (index - 8 + buttons.length) % buttons.length;
                        else if (e.key === 'ArrowDown') nextIndex = (index + 8) % buttons.length;
                        else return;

                        e.preventDefault();
                        (buttons[nextIndex] as HTMLButtonElement).focus();
                      }}
                      aria-label={`Select color ${c}`}
                      aria-pressed={color === c}
                      className={`w-8 h-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white
                        ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-110'}
                        ${c === '#4F46E5' ? 'bg-indigo-500' : ''}
                        ${c === '#EC4899' ? 'bg-pink-500' : ''}
                        ${c === '#EF4444' ? 'bg-red-500' : ''}
                        ${c === '#F97316' ? 'bg-orange-500' : ''}
                        ${c === '#EAB308' ? 'bg-yellow-500' : ''}
                        ${c === '#22C55E' ? 'bg-green-500' : ''}
                        ${c === '#06B6D4' ? 'bg-cyan-500' : ''}
                        ${c === '#3B82F6' ? 'bg-blue-500' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={onCloseAction}
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  Cancel
                </button>
                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(error)}
                  className="inline-flex items-center px-4 py-2 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {isSubmitting && <LoadingSpinner />}
                  {isSubmitting 
                    ? 'Saving...' 
                    : mode === 'create' 
                      ? 'Create Topic' 
                      : 'Save Changes'
                  }
                </button>
              </div>
            </form>
          </div>

          {showDeleteConfirm && (
            <DeleteConfirmationDialog
              isOpen={showDeleteConfirm}
              onCloseAction={() => setShowDeleteConfirm(false)}
              onConfirmAction={handleDelete}
              title="Delete Topic"
              message={hasDocuments 
                ? "Are you sure you want to delete this topic? All documents in this topic will be moved to 'No Topic'." 
                : "Are you sure you want to delete this topic?"
              }
            />
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TopicDialog;
