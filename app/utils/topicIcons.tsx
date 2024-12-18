'use client';

import { 
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
} from '@heroicons/react/24/outline';
import { TopicIcon } from '@/app/types/document.types';

const ICON_MAP: Record<TopicIcon, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>> = {
  'Folder': FolderIcon,
  'Book': BookOpenIcon,
  'Academic': AcademicCapIcon,
  'Science': BeakerIcon,
  'Math': CalculatorIcon,
  'Code': CodeBracketIcon,
  'Notes': DocumentTextIcon,
  'Geography': GlobeAltIcon,
  'Music': MusicalNoteIcon,
  'Art': PaintBrushIcon,
  'Games': PuzzlePieceIcon,
  'Physics': RocketLaunchIcon,
  'Magic': SparklesIcon,
};

export const getTopicIcon = (iconName: TopicIcon) => {
  return ICON_MAP[iconName] || FolderIcon;
};

export default ICON_MAP;
