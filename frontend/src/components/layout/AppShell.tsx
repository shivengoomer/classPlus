// src/components/layout/AppShell.tsx
'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { X, Home, Users, ClipboardList, Cpu, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileDrawerItems = [
    { label: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { label: 'My Groups', path: '/groups', icon: <Users className="w-5 h-5" /> },
    { label: 'Assignments', path: '/assignments', icon: <ClipboardList className="w-5 h-5" /> },
    { label: "AI Teacher's Toolkit", path: '/toolkit', icon: <Cpu className="w-5 h-5" /> },
    { label: 'My Library', path: '/library', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-veda-bg text-veda-text-primary overflow-auto font-sans">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:flex h-full items-start pt-5 pl-5 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 h-full min-w-0 p-4 md:p-5 gap-4 md:gap-5">
        <TopBar 
          onMenuToggle={() => setMobileMenuOpen(true)} 
        />
        
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex-1 overflow-y-auto no-scrollbar"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <MobileBottomNav />

        {/* Mobile Menu Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity">
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-veda-card-border pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'url(/logo.png) lightgray -8.481px -13.209px / 290.139% 162.5% no-repeat, linear-gradient(180deg, #E56820 0%, #D45E3E 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    />
                    <span 
                      style={{
                        color: '#303030',
                        fontFamily: '"Bricolage Grotesque", sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        letterSpacing: '-1.2px',
                      }}
                    >
                      VedaAI
                    </span>
                  </div>
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
