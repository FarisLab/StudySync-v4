'use client';

import React from 'react';
import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import './dashboard.css';

export default function Dashboard() {
  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'upload',
      document: 'Research Paper.pdf',
      time: '2 hours ago',
      icon: '📄',
    },
    {
      id: 2,
      type: 'share',
      document: 'Study Notes.docx',
      time: '5 hours ago',
      icon: '🔄',
    },
    {
      id: 3,
      type: 'edit',
      document: 'Project Proposal.pdf',
      time: '1 day ago',
      icon: '✏️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Sidebar />
        <DisplayPanel>
          <PageTransition>
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
                <p className="text-white/60">Here is an overview of your document management system</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-2">Total Documents</h3>
                  <p className="text-3xl font-bold text-white">24</p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-2">Storage Used</h3>
                  <p className="text-3xl font-bold text-white">1.2 GB</p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-2">Shared Files</h3>
                  <p className="text-3xl font-bold text-white">8</p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-2">Recent Uploads</h3>
                  <p className="text-3xl font-bold text-white">7</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white/90">Recent Activity</h2>
                  <button className="text-purple-400 hover:text-purple-300 text-sm">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          {activity.icon}
                        </div>
                        <div>
                          <h4 className="text-white/90">{activity.document}</h4>
                          <p className="text-white/60 text-sm">{activity.time}</p>
                        </div>
                      </div>
                      <span className="text-white/40 text-sm capitalize">{activity.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-4">Storage Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-white/60 mb-1">
                        <span>Used Space</span>
                        <span>1.2 GB of 2 GB</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors text-sm">
                      Upload Files
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors text-sm">
                      Share Documents
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors text-sm">
                      Create Folder
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors text-sm">
                      View Recent
                    </button>
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
