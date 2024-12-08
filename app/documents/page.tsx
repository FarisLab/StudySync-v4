'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import DisplayPanel from '../components/DisplayPanel';
import PageTransition from '../components/PageTransition';
import { 
  FolderPlusIcon, 
  ArrowUpTrayIcon, 
  TrashIcon,
  PencilIcon,
  FolderIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// Mock data for documents
const mockDocuments = [
  { id: 1, name: 'Research Paper.pdf', type: 'pdf', size: '2.4 MB', lastModified: '2 hours ago' },
  { id: 2, name: 'Study Notes.docx', type: 'docx', size: '1.1 MB', lastModified: '5 hours ago' },
  { id: 3, name: 'Presentation.pptx', type: 'pptx', size: '4.2 MB', lastModified: '1 day ago' },
];

export default function Documents() {
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log('Files uploaded:', e.target.files);
  };

  const toggleDocumentSelection = (id: number) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

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
              {/* Header Section */}
              <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
                <p className="text-white/60">Manage and organize your files</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all group-hover:border-purple-500/50">
                    <ArrowUpTrayIcon className="h-6 w-6 text-purple-400 mb-4" />
                    <h3 className="text-white/80 text-lg font-semibold">Upload Files</h3>
                    <p className="text-white/40 text-sm mt-1">Drag and drop or click to upload</p>
                  </div>
                </label>
                
                <button className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:border-purple-500/50 text-left">
                  <FolderPlusIcon className="h-6 w-6 text-purple-400 mb-4" />
                  <h3 className="text-white/80 text-lg font-semibold">New Folder</h3>
                  <p className="text-white/40 text-sm mt-1">Create a new folder to organize files</p>
                </button>

                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-white/80 text-lg font-semibold mb-4">Storage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Used Space</span>
                      <span>7.7 GB of 10 GB</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '77%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Management */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white/90">Your Documents</h2>
                  <div className="flex gap-2">
                    {selectedDocuments.length > 0 && (
                      <>
                        <button
                          onClick={() => setIsRenaming(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Rename
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm">
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {mockDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocumentSelection(doc.id)}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                        selectedDocuments.includes(doc.id)
                          ? 'bg-purple-500/20 border border-purple-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <DocumentIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-white/90">{doc.name}</h4>
                          <p className="text-white/40 text-sm">{doc.size} • {doc.lastModified}</p>
                        </div>
                      </div>
                      <span className="text-white/40 text-sm uppercase">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageTransition>
        </DisplayPanel>
      </div>

      {/* Rename Modal */}
      {isRenaming && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl border border-white/10 p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Rename Document</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 mb-4"
              placeholder="Enter new name"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRenaming(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle rename logic here
                  setIsRenaming(false);
                }}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white"
              >
                Rename
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
