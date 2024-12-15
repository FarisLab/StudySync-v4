'use client';

import React, { useState, useEffect } from 'react';
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
  onClose: () => void;
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
 * @param {() => void} props.onClose - Callback function when the dialog is closed
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
  onClose,
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

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setColor(initialColor);
      setSelectedIcon(initialIcon);
      setShowDeleteConfirm(false);
    } else {
      // Reset form state when dialog closes
      setName('');
      setColor('#6366F1');
      setSelectedIcon('Folder');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialName, initialColor, initialIcon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    await onSubmit(name.trim(), color, selectedIcon);
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-lg p-6 shadow-xl transition-all border border-white/10">
          {!showDeleteConfirm ? (
            <div className="relative">
              <DialogTitle className="text-xl font-semibold text-white mb-1">
                {mode === 'create' ? 'Create New Topic' : 'Edit Topic'}
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 mb-6">
                {mode === 'create' 
                  ? 'Create a new topic to organize your documents'
                  : 'Update your topic settings'}
              </DialogDescription>

              <div className="space-y-6">
                {/* Topic Name Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter topic name"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg 
                      text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                      focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Topic Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {PRESET_ICONS.map(({ icon: Icon, name: iconName }) => (
                      <button
                        key={iconName}
                        onClick={() => setSelectedIcon(iconName)}
                        className={`p-2 rounded-lg transition-all duration-200 group
                          ${selectedIcon === iconName 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                        title={iconName}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Topic Color
                  </label>
                  <div className="grid grid-cols-8 gap-3">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full transition-all duration-200 
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
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  {mode === 'edit' && onDelete && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                  >
                    {mode === 'create' ? 'Create Topic' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <DialogTitle className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                <TrashIcon className="w-5 h-5 text-red-500" />
                Delete Topic
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400 mb-6">
                Are you sure you want to delete this topic?
              </DialogDescription>

              <div className="space-y-4">
                <p className="text-sm text-zinc-300">
                  Are you sure you want to delete the topic "{initialName}"?
                  {hasDocuments && (
                    <span className="block mt-2 text-red-400">
                      Warning: This topic has documents associated with it. They will be moved to Uncategorized.
                    </span>
                  )}
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Delete Topic
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TopicDialog;
