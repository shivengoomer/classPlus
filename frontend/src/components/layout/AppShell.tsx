import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { X, Home, Users, ClipboardList, Cpu, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '@/store/profileStore';
import BackgroundMesh from '@/components/landing/BackgroundMesh';
import ShapeGrid from '@/components/ShapeGrid';

interface AppShellProps {
  children: React.ReactNode;
}

// Module-level globals to persist state in-memory across client-side page transitions
let inMemorySidebarExpanded = true;
let isFirstMount = true;

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('sidebar_expanded');
  if (saved !== null) {
    inMemorySidebarExpanded = saved === 'true';
  }
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { profile, fetchProfile } = useProfileStore();

  // Initialize state: use expanded on first mount to prevent SSR hydration mismatch,
  // but use in-memory state on subsequent page navigations for instant, flash-free rendering.
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (isFirstMount) {
      return true; // Match server-side rendered HTML
    }
    return inMemorySidebarExpanded;
  });

  const [isLoaded, setIsLoaded] = useState(!isFirstMount);

  useEffect(() => {
    fetchProfile();
    
    // On first mount, read from localStorage and apply immediately
    if (isFirstMount) {
      const saved = localStorage.getItem('sidebar_expanded');
      if (saved !== null) {
        const val = saved === 'true';
        setIsSidebarExpanded(val);
        inMemorySidebarExpanded = val;
      }
      isFirstMount = false;
      setIsLoaded(true);
    } else {
      // On subsequent page mounts, ensure state is updated if changed elsewhere
      const saved = localStorage.getItem('sidebar_expanded');
      if (saved !== null) {
        const val = saved === 'true';
        if (val !== inMemorySidebarExpanded) {
          setIsSidebarExpanded(val);
          inMemorySidebarExpanded = val;
        }
      }
    }
  }, [fetchProfile]);

  const toggleSidebar = (val: boolean) => {
    setIsSidebarExpanded(val);
    inMemorySidebarExpanded = val;
    localStorage.setItem('sidebar_expanded', String(val));
  };

  const mobileDrawerItems = [
    { label: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { label: 'My Groups', path: '/groups', icon: <Users className="w-5 h-5" /> },
    { label: 'Assignments', path: '/assignments', icon: <ClipboardList className="w-5 h-5" /> },
    { label: "AI Teacher's Toolkit", path: '/toolkit', icon: <Cpu className="w-5 h-5" /> },
    { label: 'My Library', path: '/library', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div 
      style={{ '--sidebar-width': isSidebarExpanded ? '260px' : '82px' } as React.CSSProperties}
      className="flex h-screen bg-[#F3F4F6] text-veda-text-primary overflow-hidden font-sans relative"
    >
      
      {/* Dynamic Background Mesh & Interactive Shape Grid */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none select-none">
        <BackgroundMesh />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <ShapeGrid 
            borderColor="rgba(249, 115, 22, 0.15)" 
            hoverFillColor="rgba(249, 115, 22, 0.1)" 
            gradientColor="#F3F4F6"
            shape="hexagon"
            squareSize={56}
            speed={0.2}
            hoverTrailAmount={4}
          />
        </div>
      </div>

      {/* Desktop Sidebar (Hidden on Mobile, animated with parent frame synchronization) */}
      <motion.div 
        animate={{ width: isSidebarExpanded ? 260 : 82 }}
        transition={isLoaded ? { type: 'spring', stiffness: 220, damping: 26 } : { duration: 0 }}
        style={{ overflow: 'visible' }}
        className="hidden md:flex h-full items-stretch pt-3 pl-3 pb-3 pr-2.5 flex-shrink-0 overflow-visible"
      >
        <Sidebar 
          isExpanded={isSidebarExpanded}
          setIsExpanded={toggleSidebar}
        />
      </motion.div>

      {/* Main Container */}
      <div className="flex flex-col flex-1 h-full min-w-0 px-[20px] py-[16px] md:p-3 gap-4 md:gap-3 relative z-10">
        <TopBar 
          onMenuToggle={() => setMobileMenuOpen(true)} 
        />
        
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex-1 overflow-y-auto no-scrollbar pb-36 md:pb-0 relative z-10"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <MobileBottomNav />

        {/* Mobile Menu Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-[4px]"
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-64 bg-white/90 backdrop-blur-lg p-6 border-l border-slate-200/50 shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#10375C] flex items-center justify-center shadow-md shadow-[#10375C]/20">
                        <span className="text-white text-xs font-black">C</span>
                      </div>
                      <span 
                        style={{
                          color: 'var(--Text-Primary, #303030)',
                          fontFamily: 'var(--font-bricolage), "Bricolage Grotesque", sans-serif',
                          fontSize: '20px',
                          fontStyle: 'normal',
                          fontWeight: 700,
                          lineHeight: '140%',
                          letterSpacing: '-1.2px',
                        }}
                      >
                        ClassPilot
                      </span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 rounded-full hover:bg-slate-100/50 transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500 hover:text-slate-800" />
                    </button>
                  </div>
                  
                  <nav className="flex flex-col gap-2">
                    {mobileDrawerItems.map((item, idx) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={idx}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                            isActive 
                              ? 'bg-[#10375C]/10 text-[#10375C] border border-[#10375C]/15' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/40 border-transparent'
                          }`}
                        >
                          <span className={`${isActive ? 'text-[#10375C]' : 'text-slate-500'}`}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-slate-200/60 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#10375C] text-white flex items-center justify-center font-bold text-xs uppercase shadow-md shadow-[#10375C]/20">
                      {profile?.schoolName ? profile.schoolName.substring(0, 2) : 'DP'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-855 truncate">
                        {profile?.schoolName || 'Delhi Public School'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                        {profile?.schoolBranch || 'Bokaro Steel City'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
