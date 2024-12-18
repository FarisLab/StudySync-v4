# StudySync API Documentation

## Context APIs

### DocumentOperationsContext
Manages document operations and provides visual feedback.

```typescript
interface DocumentOperationsContextType {
  moveProgress: MoveProgress | null;
  startMoveProgress: (sourceTopicId: string | null, targetTopicId: string | null) => Promise<void>;
}

interface MoveProgress {
  sourceTopicId: string | null;
  targetTopicId: string | null;
  progress: number;
  isCompleted?: boolean;
}
```

#### Methods
- `startMoveProgress`: Initiates document move animation
  - Parameters:
    - `sourceTopicId`: ID of source topic
    - `targetTopicId`: ID of target topic
  - Returns: Promise<void>

## Component APIs

### ProgressRing
Displays circular progress with optional completion state.

```typescript
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}
```

### TopicList
Manages document organization within topics.

```typescript
interface TopicListProps {
  topics: Topic[];
  onTopicSelect: (topic: Topic) => void;
  selectedTopicId?: string;
}
```

## Utility Functions

### Document Operations
```typescript
interface DocumentOperation {
  move: (documents: Document[], targetTopic: Topic) => Promise<void>;
  delete: (documents: Document[]) => Promise<void>;
  update: (document: Document, updates: Partial<Document>) => Promise<void>;
}
```

## Animation Configuration
```typescript
const MOVE_ANIMATION_CONFIG = {
  STEPS: 10,
  INITIAL_DELAY: 200,
  STEP_DURATION: 100,
  COMPLETION_DURATION: 600,
  FINAL_DELAY: 200,
} as const;
```
