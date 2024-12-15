'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    let currentPath = '';

    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        href: '/dashboard',
        icon: HomeIcon,
      },
    ];

    paths.forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1),
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center h-14 px-8 border-b border-white/5">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500" />
            )}
            <li>
              <Link
                href={item.href}
                className={`flex items-center space-x-1 px-1.5 py-1 rounded-md text-sm 
                  ${index === breadcrumbs.length - 1
                    ? 'text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } transition-colors`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </Link>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
