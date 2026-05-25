// src/components/layout/MobileBottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, BookOpen, Cpu } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { useAssignmentStore } from '@/store/assignmentStore';

export function MobileBottomNav() {
  const pathname = usePathname();
  const assignmentsCount = useAssignmentStore((state) => state.assignments.length);

  const tabs = [
    { label: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { 
      label: 'Assignments', 
      path: '/assignments', 
      icon: <ClipboardList className="w-5 h-5" />,
      badge: assignmentsCount
    },
    { label: 'Library', path: '/library', icon: <BookOpen className="w-5 h-5" />, badge: 4 },
    { label: 'AI Toolkit', path: '/toolkit', icon: <Cpu className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-veda-btn-primary border-t border-gray-800 flex items-center justify-around px-4 z-40">
      {tabs.map((tab, idx) => {
        const isActive = pathname === tab.path || (tab.path !== '/home' && pathname.startsWith(tab.path));
        
        return (
          <Link
            key={idx}
            href={tab.path}
            className={`flex flex-col items-center justify-center gap-1 w-16 text-center ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge 
                  count={tab.badge} 
                  className="absolute -top-1.5 -right-3 !min-w-4 !h-4 !text-[9px] !px-1 bg-veda-orange" 
                />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight truncate w-full">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
