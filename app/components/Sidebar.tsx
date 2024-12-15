'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  HomeIcon, 
  FolderIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Navigation item type for sidebar links
 */
interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  badge?: number | string;
}

/**
 * Props for the Sidebar component
 */
interface SidebarProps {
  className?: string;
  storageLimit?: number; // in bytes
}

/**
 * Storage statistics type
 */
interface StorageStats {
  used: number;      // in bytes
  total: number;     // in bytes
  percentage: number; // 0-100
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Documents', href: '/documents', icon: FolderIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ className = '', storageLimit = 5 * 1024 * 1024 * 1024 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    const calculateStorageUsed = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('size')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;

        const totalBytes = data.reduce((acc, doc) => acc + doc.size, 0);
        const totalGB = totalBytes / (1024 * 1024 * 1024);
        const percentage = Math.min(Math.round((totalGB / 2) * 100), 100); // Assuming 2GB limit
        setStorageUsed(percentage);
      } catch (error) {
        console.error('Error calculating storage:', error);
        setStorageUsed(0);
      }
    };

    calculateStorageUsed();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-16 bg-black/40 backdrop-blur-lg border-r border-white/10 ${className}`}>
      <div className="flex h-full flex-col justify-between py-4">
        {/* Navigation */}
        <nav className="space-y-2 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {/* Tooltip */}
                <span className="absolute left-full ml-2 w-auto min-w-max rounded bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 space-y-2">
          {/* Storage Indicator */}
          <div className="group relative">
            <div className="h-10 w-10 rounded-lg bg-white/5 p-1">
              <div className="relative h-full w-full">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-white/10"
                    strokeWidth="3"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-blue-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${storageUsed}, 100`}
                    transform="rotate(-90 18 18)"
                  />
                  {/* Percentage text */}
                  <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    dy=".3em"
                    className="fill-current text-xs font-medium text-white"
                  >
                    {storageUsed}%
                  </text>
                </svg>
              </div>
            </div>
            {/* Storage tooltip */}
            <span className="absolute left-full bottom-0 ml-2 w-auto min-w-max rounded bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
              Storage Used: {storageUsed}%
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="absolute left-full ml-2 w-auto min-w-max rounded bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
