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
  BookOpenIcon,
  UserGroupIcon,
  CalendarIcon,
  AcademicCapIcon,
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
  { name: 'Study', href: '/study', icon: AcademicCapIcon },
  { name: 'Groups', href: '/groups', icon: UserGroupIcon, badge: 'Soon' },
  { name: 'Planner', href: '/planner', icon: CalendarIcon, badge: 'Soon' },
  { name: 'Flashcards', href: '/flashcards', icon: BookOpenIcon, badge: 'Soon' },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ className = '', storageLimit = 5 * 1024 * 1024 * 1024 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [storageStats, setStorageStats] = useState<StorageStats>({
    used: 0,
    total: storageLimit,
    percentage: 0
  });

  useEffect(() => {
    const calculateStorageUsed = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('size')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;

        const totalBytes = data.reduce((acc, doc) => acc + (doc.size || 0), 0);
        setStorageStats({
          used: totalBytes,
          total: storageLimit,
          percentage: Math.min((totalBytes / storageLimit) * 100, 100)
        });
      } catch (error) {
        console.error('Error calculating storage:', error);
        setStorageStats({
          used: 0,
          total: storageLimit,
          percentage: 0
        });
      }
    };

    calculateStorageUsed();
  }, [supabase, storageLimit]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

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
                    ? 'bg-purple-500/20 text-purple-500'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-medium text-white">
                    {item.badge}
                  </span>
                )}
                <span className="absolute left-14 z-50 w-auto min-w-max origin-left scale-0 rounded-lg bg-gray-900 px-2 py-1 text-sm text-white shadow-md transition-all group-hover:scale-100">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-2 space-y-4">
          {/* Storage Section */}
          <div className="group relative">
            <div className="h-10 w-10 flex items-center justify-center text-white/60">
              <div className="w-6 h-6">
                <div className="w-full h-1 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${storageStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
            {/* Storage tooltip */}
            <div className="absolute left-14 bottom-0 z-50 w-48 origin-left scale-0 rounded-lg bg-gray-900 p-2 text-sm text-white shadow-md transition-all group-hover:scale-100">
              <h3 className="mb-1 font-medium">Storage</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">{formatBytes(storageStats.used)} used</span>
                  <span className="text-white/40">{formatBytes(storageStats.total)} total</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${storageStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
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
