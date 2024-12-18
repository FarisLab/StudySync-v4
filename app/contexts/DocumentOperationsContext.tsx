'use client';

import React, { createContext, useContext, useState } from 'react';

export const MOVE_ANIMATION_CONFIG = {
  STEPS: 10,
  INITIAL_DELAY: 200,
  STEP_DURATION: 100,
  COMPLETION_DURATION: 600,
  FINAL_DELAY: 200,
} as const;

interface MoveProgress {
  sourceTopicId: string | null;
  targetTopicId: string | null;
  progress: number;
  isCompleted?: boolean;
}

interface DocumentOperationsContextType {
  moveProgress: MoveProgress | null;
  setMoveProgress: (progress: MoveProgress | null) => void;
  startMoveProgress: (sourceTopicId: string | null, targetTopicId: string | null) => Promise<void>;
}

const DocumentOperationsContext = createContext<DocumentOperationsContextType | undefined>(undefined);

export function DocumentOperationsProvider({ children }: { children: React.ReactNode }) {
  const [moveProgress, setMoveProgress] = useState<MoveProgress | null>(null);

  const startMoveProgress = async (sourceTopicId: string | null, targetTopicId: string | null) => {
    // Set initial progress
    setMoveProgress({ sourceTopicId, targetTopicId, progress: 0 });

    // Initial delay
    await new Promise(resolve => setTimeout(resolve, MOVE_ANIMATION_CONFIG.INITIAL_DELAY));

    // Animate progress steps
    for (let i = 1; i <= MOVE_ANIMATION_CONFIG.STEPS; i++) {
      await new Promise(resolve => setTimeout(resolve, MOVE_ANIMATION_CONFIG.STEP_DURATION));
      setMoveProgress(prev => prev ? { ...prev, progress: i / MOVE_ANIMATION_CONFIG.STEPS } : null);
    }

    // Pause briefly at full progress before showing completion
    await new Promise(resolve => setTimeout(resolve, 100));
  
    // Show completion state
    setMoveProgress(prev => prev ? { ...prev, progress: 1, isCompleted: true } : null);
    await new Promise(resolve => setTimeout(resolve, MOVE_ANIMATION_CONFIG.COMPLETION_DURATION));

    // Final delay before cleanup
    await new Promise(resolve => setTimeout(resolve, MOVE_ANIMATION_CONFIG.FINAL_DELAY));
    setMoveProgress(null);
  };

  return (
    <DocumentOperationsContext.Provider value={{ moveProgress, setMoveProgress, startMoveProgress }}>
      {children}
    </DocumentOperationsContext.Provider>
  );
}

export function useDocumentOperations() {
  const context = useContext(DocumentOperationsContext);
  if (context === undefined) {
    throw new Error('useDocumentOperations must be used within a DocumentOperationsProvider');
  }
  return context;
}
