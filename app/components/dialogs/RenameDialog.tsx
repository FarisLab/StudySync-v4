'use client';

import { useState, useEffect } from 'react';
import { BaseDocument } from '@/app/types/document.types';

interface RenameDialogProps {
  document: BaseDocument;
  isOpen: boolean;
  onClose: () => void;
  onRename: (document: BaseDocument, newName: string) => Promise<void>;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  document,
  isOpen,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState(document.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewName(document.name);
  }, [document.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRename(document, newName);
      onClose();
    } catch (error) {
      console.error('Error renaming document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Rename Document</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
              Document Name
            </label>
            <input
              type="text"
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white 
                focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !newName.trim() || newName === document.name}
            >
              {isSubmitting ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameDialog;
