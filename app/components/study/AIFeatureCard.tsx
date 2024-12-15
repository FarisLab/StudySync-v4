import React from 'react';
import { 
  BoltIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentMagnifyingGlassIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface AIFeature {
  id: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  bgClass: string;
  textClass: string;
}

export const AI_FEATURES: AIFeature[] = [
  {
    id: 'chat',
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Study Assistant Chat',
    description: 'Get instant help with concepts, problem-solving, and study strategies',
    bgClass: 'bg-purple-500/10 hover:bg-purple-500/20',
    textClass: 'text-purple-300',
  },
  {
    id: 'summarize',
    icon: DocumentMagnifyingGlassIcon,
    title: 'Content Summarizer',
    description: 'Generate concise summaries of your study materials',
    bgClass: 'bg-blue-500/10 hover:bg-blue-500/20',
    textClass: 'text-blue-300',
  },
  {
    id: 'quiz',
    icon: LightBulbIcon,
    title: 'Quiz Generator',
    description: 'Create practice questions from your documents',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    textClass: 'text-emerald-300',
  },
];

interface AIFeatureCardProps {
  feature: AIFeature;
  onSelect: (featureId: string) => void;
  isActive: boolean;
}

export function AIFeatureCard({ feature, onSelect, isActive }: AIFeatureCardProps) {
  return (
    <button
      onClick={() => onSelect(feature.id)}
      className={`w-full p-6 rounded-xl border transition-all duration-200 text-left
        ${isActive 
          ? 'bg-gray-800/50 border-purple-500/50' 
          : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/40 hover:border-gray-600/50'
        }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 
        ${feature.bgClass}`}
      >
        <feature.icon className={`w-6 h-6 ${feature.textClass}`} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-gray-400 text-sm">{feature.description}</p>
    </button>
  );
}
