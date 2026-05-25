// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  ClipboardList, 
  Cpu, 
  BookOpen, 
  Settings,
  Sparkles
} from 'lucide-react';
import { PillButton } from '../shared/PillButton';
import { Badge } from '../shared/Badge';
import { useAssignmentStore } from '@/store/assignmentStore';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const assignments = useAssignmentStore((state) => state.assignments);
  
  // Counts
  const assignmentsCount = assignments.length;

  const navItems = [
    { label: 'Home', path: '#', icon: <Home className="w-5 h-5" /> },
    { label: 'My Groups', path: '#', icon: <Users className="w-5 h-5" /> },
    { 
      label: 'Assignments', 
      path: '/assignments', 
      icon: <ClipboardList className="w-5 h-5" />,
      badge: assignmentsCount
    },
    { label: "AI Teacher's Toolkit", path: '#', icon: <Cpu className="w-5 h-5" /> },
    { 
      label: 'My Library', 
      path: '#', 
      icon: <BookOpen className="w-5 h-5" />,
      badge: 4 
    },
  ];

  return (
    <aside className="w-[280px] h-screen bg-veda-sidebar border-r border-veda-card-border flex flex-col justify-between p-6 flex-shrink-0">
      <div className="flex flex-col gap-6">
        {/* VedaAI Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-veda-orange to-veda-orange-red flex items-center justify-center font-bold text-white text-lg shadow-sm">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-veda-text-primary">VedaAI</span>
        </div>

        {/* Create Assignment Button */}
        <PillButton
          variant="gradient-border"
          className="w-full justify-center"
          icon={<Sparkles className="w-4 h-4 text-veda-orange animate-pulse" />}
          onClick={() => router.push('/create')}
        >
          Create Assignment
        </PillButton>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item, idx) => {
            // Check active state
            const isActive = pathname.startsWith(item.path) && item.path !== '#';
            
            return (
              <Link
                key={idx}
                href={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-veda-nav-active-bg text-veda-text-primary font-medium' 
                    : 'text-veda-text-secondary hover:bg-gray-50 hover:text-veda-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-veda-orange' : 'text-veda-text-secondary'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge count={item.badge} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 border-t border-veda-card-border pt-4">
        {/* Settings */}
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm text-veda-text-secondary hover:bg-gray-50 hover:text-veda-text-primary rounded-lg transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        {/* School Card */}
        <div className="p-3 bg-gray-50 rounded-xl border border-veda-card-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-veda-orange text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            DP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-veda-text-primary truncate">
              Delhi Public School
            </span>
            <span className="text-xs text-veda-text-secondary truncate">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
