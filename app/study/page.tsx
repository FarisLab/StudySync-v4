'use client';

import React, { useState } from 'react';
import { 
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import { AIFeatureCard, AI_FEATURES } from '../components/study/AIFeatureCard';

interface StudySession {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  duration: string;
  status: 'completed' | 'in-progress';
}

export default function Study() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Mock study sessions (in a real app, this would come from a database)
  const recentSessions: StudySession[] = [
    {
      id: '1',
      type: 'chat',
      title: 'Physics Concepts Review',
      timestamp: '2 hours ago',
      duration: '45 min',
      status: 'completed',
    },
    {
      id: '2',
      type: 'summarize',
      title: 'Chapter 5 Summary',
      timestamp: '5 hours ago',
      duration: '15 min',
      status: 'completed',
    },
    {
      id: '3',
      type: 'quiz',
      title: 'Biology Quiz Practice',
      timestamp: 'Just now',
      duration: '20 min',
      status: 'in-progress',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      
      <div className="relative z-10">
        <Sidebar />
        <DisplayPanel>
          <PageTransition>
            <div className="p-8 space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Study Assistant</h1>
                <p className="text-gray-400">Select a study tool or continue your previous session</p>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Features */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-semibold text-white">Study Tools</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {AI_FEATURES.map((feature) => (
                      <AIFeatureCard
                        key={feature.id}
                        feature={feature}
                        onSelect={setSelectedFeature}
                        isActive={selectedFeature === feature.id}
                      />
                    ))}
                  </div>

                  {/* Selected Feature Content */}
                  {selectedFeature && (
                    <div className="mt-6 p-6 rounded-xl bg-gray-800/30 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          {AI_FEATURES.find(f => f.id === selectedFeature)?.title}
                        </h3>
                        <button className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors">
                          Start New Session
                        </button>
                      </div>
                      <p className="text-gray-400">Select your study materials to begin...</p>
                    </div>
                  )}
                </div>

                {/* Recent Sessions */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{session.title}</h4>
                          {session.status === 'in-progress' ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-sm">
                              <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              In Progress
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-blue-400 text-sm">
                              <CheckCircleIcon className="w-4 h-4" />
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {session.duration}
                          </span>
                          <span>{session.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PageTransition>
        </DisplayPanel>
      </div>
    </div>
  );
}
