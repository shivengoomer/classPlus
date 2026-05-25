// src/components/layout/AppShell.tsx
'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { useRouter } from 'next/navigation';
import { Plus, X, Home, Users, ClipboardList, Cpu, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  backPath?: string;
}

export function AppShell({ children, title, backPath }: AppShellProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileDrawerItems = [
    { label: 'Home', path: '#', icon: <Home className="w-5 h-5" /> },
    { label: 'My Groups', path: '#', icon: <Users className="w-5 h-5" /> },
    { label: 'Assignments', path: '/assignments', icon: <ClipboardList className="w-5 h-5" /> },
    { label: "AI Teacher's Toolkit", path: '#', icon: <Cpu className="w-5 h-5" /> },
    { label: 'My Library', path: '#', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Settings', path: '#', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-veda-bg text-veda-text-primary overflow-hidden font-sans">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 relative">
        <TopBar 
          title={title} 
          backPath={backPath} 
          onMenuToggle={() => setMobileMenuOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 no-scrollbar">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <MobileBottomNav />

        {/* Mobile Floating Action Button (FAB) (Hidden on Desktop) */}
        <button
          onClick={() => router.push('/create')}
          className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-veda-card-border hover:scale-105 active:scale-95 transition-all z-40"
          style={{ boxShadow: '0 4px 14px rgba(249, 115, 22, 0.2)' }}
        >
          <Plus className="w-8 h-8 text-veda-orange font-bold" />
        </button>

        {/* Mobile Menu Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity">
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-veda-card-border pb-4 mb-4">
                  <span className="font-bold text-lg">Menu</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <X className="w-6 h-6 text-veda-text-secondary" />
                  </button>
                </div>
                
                <nav className="flex flex-col gap-3">
                  {mobileDrawerItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-veda-text-secondary hover:text-veda-text-primary py-2 text-sm font-medium transition-colors"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="border-t border-veda-card-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-veda-orange text-white flex items-center justify-center font-bold text-xs">
                    DP
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-veda-text-primary truncate">Delhi Public School</span>
                    <span className="text-[10px] text-veda-text-secondary truncate">Bokaro Steel City</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
