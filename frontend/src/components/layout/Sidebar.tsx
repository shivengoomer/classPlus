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
  Sparkle
} from 'lucide-react';
import { PillButton } from '../shared/PillButton';
import { Badge } from '../shared/Badge';
import { useAssignmentStore } from '@/store/assignmentStore';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const assignments = useAssignmentStore((state) => state.assignments);
  
  // Dynamic assignment count
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
        
        {/* VedaAI Brand Logo (Matches Figma screenshot) */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="9" fill="#1E1E1E" />
              <path d="M9 10H12.5L16 18L19.5 10H23L17.5 22.5H14.5L9 10Z" fill="url(#v-gradient)" />
              <defs>
                <linearGradient id="v-gradient" x1="16" y1="10" x2="16" y2="22.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="#E0E0E0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-veda-text-primary">VedaAI</span>
        </div>

        {/* Create Assignment Button (with solid sparkle icon) */}
        <PillButton
          variant="gradient-border"
          className="w-full justify-center text-sm font-semibold tracking-tight"
          icon={<Sparkle className="w-4 h-4 fill-white text-transparent" />}
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] transition-all duration-200 ${
                  isActive 
                    ? 'bg-veda-nav-active-bg text-veda-text-primary font-bold shadow-sm' 
                    : 'text-veda-text-secondary hover:bg-gray-50 hover:text-veda-text-primary font-normal'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-veda-orange' : 'text-veda-text-secondary'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge count={item.badge} className={isActive ? 'bg-veda-orange' : 'bg-veda-orange'} />
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

        {/* Delhi Public School Card (with custom green school crest avatar) */}
        <div className="p-3 bg-gray-50 rounded-xl border border-veda-card-border flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#E6F4EA" />
              <path d="M20 11C23 11 25.5 12.5 25.5 12.5V20C25.5 24 20 27 20 27C20 27 14.5 24 14.5 20V12.5C14.5 12.5 17 11 20 11Z" stroke="#059669" strokeWidth="1.5" fill="#A7F3D0" />
              <path d="M20 14V22" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
              <path d="M17.5 17H22.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            </svg>
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
