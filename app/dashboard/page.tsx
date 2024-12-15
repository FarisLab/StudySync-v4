'use client';

import React from 'react';
import { 
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  CalendarIcon,
  BookOpenIcon,
  UsersIcon,
  BoltIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import { useStorage } from '../hooks/useStorage';

export default function Dashboard() {
  const { usedStorage, totalStorage, percentUsed } = useStorage();

  // Quick actions configuration
  const quickActions = [
    { 
      icon: ArrowUpTrayIcon, 
      label: 'Upload Documents', 
      color: 'purple',
      bgClass: 'bg-purple-500/10 hover:bg-purple-500/20',
      textClass: 'text-purple-300',
    },
    { 
      icon: ShareIcon, 
      label: 'Share Notes', 
      color: 'blue',
      bgClass: 'bg-blue-500/10 hover:bg-blue-500/20',
      textClass: 'text-blue-300',
    },
    { 
      icon: ChatBubbleLeftRightIcon, 
      label: 'Start Discussion', 
      color: 'emerald',
      bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      textClass: 'text-emerald-300',
    },
    { 
      icon: RocketLaunchIcon, 
      label: 'Quick Study', 
      color: 'amber',
      bgClass: 'bg-amber-500/10 hover:bg-amber-500/20',
      textClass: 'text-amber-300',
    },
  ];

  // Feature sections
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Document Management',
      description: 'Organize and manage your study materials',
      status: '24 Documents',
      isAvailable: true,
    },
    {
      icon: UsersIcon,
      title: 'Study Groups',
      description: 'Collaborate with peers in study groups',
      status: 'Coming Soon',
      isAvailable: false,
    },
    {
      icon: CalendarIcon,
      title: 'Study Planner',
      description: 'Plan and track your study sessions',
      status: 'Coming Soon',
      isAvailable: false,
    },
    {
      icon: BookOpenIcon,
      title: 'Flashcards',
      description: 'Create and study with flashcards',
      status: 'Coming Soon',
      isAvailable: false,
    },
  ];

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'upload',
      document: 'Research Paper.pdf',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'share',
      document: 'Study Notes.docx',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'edit',
      document: 'Project Proposal.pdf',
      time: '1 day ago',
    },
  ];

  // Upcoming features
  const upcomingFeatures = [
    {
      icon: BoltIcon,
      title: 'AI Study Assistant',
      description: 'Get personalized study recommendations',
      status: 'In Development',
      statusClass: 'text-blue-400 bg-blue-500/20',
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Analytics',
      description: 'Track your study progress with detailed analytics',
      status: 'Coming Q1 2024',
      statusClass: 'text-blue-400 bg-blue-500/20',
    },
    {
      icon: StarIcon,
      title: 'Study Achievements',
      description: 'Earn badges and track your milestones',
      status: 'Planning Phase',
      statusClass: 'text-blue-400 bg-blue-500/20',
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
              {/* Header with Welcome and Storage */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome to StudySync</h1>
                  <p className="text-gray-400">Your all-in-one study management platform</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-2">
                    {usedStorage || '0 B'} used of {totalStorage || '10.0 GB'}
                  </div>
                  <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${Math.min(percentUsed || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-xl ${action.bgClass} 
                      transition-all duration-200 hover:scale-[1.02] w-full`}
                  >
                    <action.icon className={`w-5 h-5 ${action.textClass}`} />
                    <span className={`font-medium ${action.textClass}`}>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl bg-gray-800/30 border border-gray-700/50 transition-all duration-200 
                      ${feature.isAvailable ? 'hover:border-purple-500/50 hover:bg-gray-800/50' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
                      ${feature.isAvailable ? 'bg-purple-500/10 text-purple-300' : 'bg-gray-700/50 text-gray-300'}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={feature.isAvailable ? 'text-purple-400' : 'text-gray-500'}>
                        {feature.status}
                      </span>
                      {!feature.isAvailable && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity and Coming Soon */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-300">
                          {activity.type === 'upload' ? <ArrowUpTrayIcon className="w-5 h-5" /> :
                           activity.type === 'share' ? <ShareIcon className="w-5 h-5" /> :
                           <DocumentTextIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{activity.document}</h4>
                          <p className="text-gray-400 text-sm">{activity.time}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm capitalize px-3 py-1 rounded-full bg-gray-700/50">
                        {activity.type}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coming Soon */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-4">Coming Soon</h2>
                  {upcomingFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-blue-400">
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">{feature.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${feature.statusClass}`}>
                              {feature.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageTransition>
        </DisplayPanel>
      </div>
    </div>
  );
}
