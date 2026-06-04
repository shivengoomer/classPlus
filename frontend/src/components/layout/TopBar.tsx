// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  ArrowLeft, 
  User, 
  CreditCard, 
  LogOut, 
  Sparkles, 
  Search, 
  Plus, 
  Home, 
  ClipboardList, 
  Users, 
  Cpu, 
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '../shared/Badge';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationPanel } from './NotificationPanel';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssignmentStore } from '@/store/assignmentStore';

interface TopBarProps {
  onMenuToggle?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Assessments';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileUserDropdown, setShowMobileUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(true);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileUserDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        mobileUserDropdownRef.current && 
        !mobileUserDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMobileUserDropdown(false);
      }

      const isInsidePanel = (event.target as Element).closest('.notifications-panel');
      const isInsideBell = (event.target as Element).closest('.bell-trigger');
      
      if (!isInsidePanel && !isInsideBell) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User' : 'John Doe';

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [wasSignedIn, setWasSignedIn] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        setWasSignedIn(true);
      } else if (wasSignedIn) {
        setIsLoggingOut(true);
      }
    }
  }, [isLoaded, isSignedIn, wasSignedIn]);

  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Back navigation path helper
  const handleBack = () => {
    if (pathname === '/assignments') {
      router.push('#'); 
    } else {
      router.push('/assignments');
    }
  };

  // Breadcrumb path helper
  const getBreadcrumb = () => {
    if (pathname === '/home') return { parent: 'Workspace', current: 'Dashboard' };
    if (pathname === '/groups') return { parent: 'Workspace', current: 'Classrooms' };
    if (pathname === '/assignments') return { parent: 'Workspace', current: 'Assessments' };
    if (pathname === '/toolkit') return { parent: 'Workspace', current: 'AI Toolkit' };
    if (pathname === '/library') return { parent: 'Workspace', current: 'Library' };
    if (pathname === '/create') return { parent: 'Assessments', current: 'New Assessment' };
    if (pathname === '/settings') return { parent: 'Settings', current: 'Profile' };
    if (pathname === '/billing') return { parent: 'Settings', current: 'Billing' };
    if (pathname.includes('/result')) return { parent: 'Assessments', current: 'Results' };
    if (pathname.includes('/status')) return { parent: 'Assessments', current: 'Processing' };
    return { parent: 'Workspace', current: 'VedAI' };
  };

  const breadcrumbs = getBreadcrumb();

  const { assignments } = useAssignmentStore();

  const commandItems: CommandItem[] = [
    {
      id: 'nav-home',
      title: 'Go to Dashboard',
      category: 'Navigation',
      icon: <Home className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/home');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'nav-assignments',
      title: 'Go to Assessments',
      category: 'Navigation',
      icon: <ClipboardList className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/assignments');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'nav-groups',
      title: 'Go to Classrooms',
      category: 'Navigation',
      icon: <Users className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/groups');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'nav-toolkit',
      title: 'Go to AI Toolkit',
      category: 'Navigation',
      icon: <Cpu className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/toolkit');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'nav-library',
      title: 'Go to Library',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/library');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'nav-settings',
      title: 'Go to Profile Settings',
      category: 'Navigation',
      icon: <User className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/settings');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'nav-billing',
      title: 'Go to Billing',
      category: 'Navigation',
      icon: <CreditCard className="w-4 h-4 text-slate-500" />,
      action: () => {
        router.push('/billing');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'action-create',
      title: 'Create New Assessment',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-orange-500" />,
      shortcut: 'N',
      action: () => {
        router.push('/create');
        setIsCommandMenuOpen(false);
      }
    },
    {
      id: 'action-logout',
      title: 'Log Out Session',
      category: 'Actions',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      action: async () => {
        setIsCommandMenuOpen(false);
        setIsLoggingOut(true);
        await signOut();
        router.push('/sign-in');
      }
    },
    ...assignments.map((item) => ({
      id: `assignment-${item._id}`,
      title: `View Assessment: ${item.title}`,
      category: 'Assessments' as const,
      icon: <ClipboardList className="w-4.5 h-4.5 text-orange-600 bg-orange-50 p-0.5 rounded" />,
      action: () => {
        if (item.status === 'done') {
          router.push(`/result/${item._id}`);
        } else {
          router.push(`/status/${item.jobId}`);
        }
        setIsCommandMenuOpen(false);
      }
    }))
  ];

  // Global hotkey detection for ⌘K or Ctrl K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset indices on open
  useEffect(() => {
    if (isCommandMenuOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandMenuOpen]);

  const filteredItems = commandItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Command Menu keyboard navigation
  useEffect(() => {
    if (!isCommandMenuOpen || filteredItems.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsCommandMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandMenuOpen, filteredItems, selectedIndex]);

  return (
    <>
      <header className="w-full md:max-w-[1100px] h-[58px] bg-transparent border-0 shadow-none mx-auto shrink-0 z-30 relative select-none">
        
        {/* DESKTOP SPLIT TOP BAR (Left, Center, and Right Pills, empty space in between) */}
        <div className="hidden md:flex items-center justify-between w-full h-full bg-transparent border-0 shadow-none gap-[10px]">
          
          {/* Left Floating Glass Pill */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-full py-1.5 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-full">
            <button
              onClick={handleBack}
              className="w-7 h-7 rounded-full border border-slate-200/80 bg-white flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-slate-600 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-400">{breadcrumbs.parent}</span>
              <span className="font-bold text-slate-300">/</span>
              <span className="font-black text-slate-800 font-sans tracking-tight">{breadcrumbs.current}</span>
            </div>
          </div>

          {/* Center Floating Glass Pill (Search / Command Shortcut) */}
          <button 
            onClick={() => setIsCommandMenuOpen(true)}
            className="flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-full py-1.5 px-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-full w-[260px] text-slate-400 hover:bg-white/95 hover:text-slate-600 hover:border-white/80 active:scale-95 transition-all text-xs font-bold cursor-pointer border-0"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Search...</span>
            </div>
            <kbd className="bg-slate-100/80 border border-slate-200/60 px-1.5 py-0.5 rounded-md text-[9px] font-sans font-black text-slate-500 shadow-sm leading-none flex items-center gap-0.5 select-none">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>

          {/* Right Floating Glass Pill */}
          <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md border border-white/60 rounded-full p-1.5 pr-3 shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-full">
            {/* Notification Bell */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-all text-slate-600 border border-transparent cursor-pointer bg-transparent bell-trigger ${
                  showNotifications 
                    ? 'bg-slate-100/80 border-slate-200/40' 
                    : 'hover:bg-slate-100/40'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <Badge 
                    count={unreadCount} 
                    className="absolute top-0.5 right-0.5" 
                  />
                )}
              </button>
    
              <AnimatePresence>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} className="absolute top-[48px] right-0 w-96" />
                )}
              </AnimatePresence>
            </div>
    
            {/* User Profile Capsule */}
            <div ref={userDropdownRef} className="relative flex items-center">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 bg-slate-50/50 hover:bg-slate-100/40 border border-slate-200/50 p-0.5 rounded-full pr-3.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-slate-200/60 bg-slate-50 flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="16" fill="#FDE68A" />
                      <circle cx="16" cy="15" r="7" fill="#D97706" />
                    </svg>
                  )}
                </div>
                
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[11px] font-black text-slate-700">{userName}</span>
                  <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-1 py-0.2 rounded-md uppercase">Educator</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </button>
    
              {/* Floating Dropdown Menu */}
              {showUserDropdown && (
                <div 
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.06), 0 20px 48px 0 rgba(0, 0, 0, 0.08)',
                  }}
                  className="absolute right-0 top-[48px] w-48 bg-white border border-slate-200/60 py-2.5 z-[100] flex flex-col gap-0.5"
                >
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors mx-1.5 rounded-xl"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  
                  <Link 
                    href="/billing" 
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors mx-1.5 rounded-xl"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Billing</span>
                  </Link>
                  
                  <div className="border-t border-slate-100 my-1 mx-3"></div>
                  
                  <button 
                    onClick={async () => {
                      setShowUserDropdown(false);
                      setIsLoggingOut(true);
                      await signOut();
                      router.push('/sign-in');
                    }}
                    className="flex items-center gap-3 w-[calc(100%-12px)] text-left px-4 py-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors mx-1.5 rounded-xl border-0 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* MOBILE UNIFIED TOP BAR */}
        <div className="flex md:hidden items-center justify-between w-full h-[50px] bg-transparent border-0 shadow-none px-1 select-none">
          <div className="flex items-center">
            <span 
              style={{
                fontFamily: 'var(--font-bricolage), "Bricolage Grotesque", sans-serif',
              }}
              className="text-xl font-bold tracking-tight text-slate-900 leading-none"
            >
              VedaAI<span className="text-orange-500">.</span>
            </span>
          </div>
  
          <div className="flex items-center gap-2">
            {/* Mobile Search Button (Klarna Grid style) */}
            <button 
              onClick={() => setIsCommandMenuOpen(true)}
              className="w-10 h-10 bg-white border border-slate-200/60 shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer relative border-0"
            >
              <LayoutGrid className="w-4.5 h-4.5 text-slate-850" />
            </button>

            {/* Mobile Notification Bell */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-white border border-slate-200/60 shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-all cursor-pointer relative border-0 bell-trigger"
              >
                <Bell className="w-4.5 h-4.5 text-slate-850" />
                {unreadCount > 0 && (
                  <Badge 
                    count={unreadCount} 
                    className="absolute -top-0.5 -right-0.5" 
                  />
                )}
              </button>
            </div>
    
            {/* Mobile User Profile / Settings */}
            <div ref={mobileUserDropdownRef} className="relative flex items-center">
              <button 
                onClick={() => setShowMobileUserDropdown(!showMobileUserDropdown)}
                className="w-10 h-10 bg-white border border-slate-200/60 shadow-sm rounded-full overflow-hidden flex items-center justify-center active:scale-95 transition-all cursor-pointer relative border-0"
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4.5 h-4.5 text-slate-850" />
                )}
              </button>
    
              <AnimatePresence>
                {showMobileUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 20px 48px rgba(0, 0, 0, 0.06)',
                    }}
                    className="absolute right-0 top-[48px] w-48 bg-white border border-slate-200/60 py-2.5 z-[100] flex flex-col gap-0.5"
                  >
                    <Link 
                      href="/settings" 
                      className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-50 transition-colors mx-1.5 rounded-xl" 
                      onClick={() => setShowMobileUserDropdown(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link 
                      href="/billing" 
                      className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-655 hover:text-slate-900 hover:bg-slate-50 transition-colors mx-1.5 rounded-xl" 
                      onClick={() => setShowMobileUserDropdown(false)}
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>Billing</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1 mx-3"></div>
                    <button 
                      onClick={async () => {
                        setShowMobileUserDropdown(false);
                        setIsLoggingOut(true);
                        await signOut();
                        router.push('/sign-in');
                      }}
                      className="flex items-center gap-3 w-[calc(100%-12px)] text-left px-4 py-2 text-xs font-bold text-red-500 hover:text-red-655 hover:bg-red-50 transition-colors mx-1.5 rounded-xl border-0 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Log out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Centered Notification Panel at Header Level */}
        <AnimatePresence>
          {showNotifications && (
            <div className="md:hidden absolute top-[58px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] z-[100]">
              <NotificationPanel onClose={() => setShowNotifications(false)} className="w-full" />
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isCommandMenuOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            />
            
            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col z-10"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  autoFocus
                  className="w-full bg-transparent text-sm text-slate-800 outline-none border-none placeholder-slate-400 font-sans"
                />
                <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-sans font-black text-slate-400 shadow-sm select-none leading-none">
                  ESC
                </kbd>
              </div>

              {/* Items List */}
              <div className="max-h-[320px] overflow-y-auto p-2 no-scrollbar">
                {filteredItems.length > 0 ? (
                  <div>
                    {['Navigation', 'Actions', 'Assessments'].map((cat) => {
                      const catItems = filteredItems.filter(item => item.category === cat);
                      if (catItems.length === 0) return null;
                      return (
                        <div key={cat} className="mb-2">
                          <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {cat}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {catItems.map((item) => {
                              const absoluteIndex = filteredItems.findIndex(fi => fi.id === item.id);
                              const isSelected = absoluteIndex === selectedIndex;
                              return (
                                <button
                                  key={item.id}
                                  onClick={item.action}
                                  onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left border-0 cursor-pointer w-full ${
                                    isSelected 
                                      ? 'bg-orange-500/10 text-orange-600' 
                                      : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                                      {item.icon}
                                    </span>
                                    <span>{item.title}</span>
                                  </div>
                                  {item.shortcut && (
                                    <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-mono select-none ${
                                      isSelected 
                                        ? 'bg-orange-500/20 text-orange-600 border border-orange-500/10' 
                                        : 'bg-slate-50 border border-slate-200 text-slate-400'
                                    }`}>
                                      {item.shortcut}
                                    </kbd>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-bold font-sans">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 font-bold font-sans select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="bg-slate-200 px-1 rounded text-[8px]">↑↓</span> Navigate</span>
                  <span className="flex items-center gap-1"><span className="bg-slate-200 px-1 rounded text-[8px]">↵</span> Select</span>
                </div>
                <span>ClassPilot Command Menu</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  
      {/* Fullscreen secure logout loader */}
      {isLoggingOut && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-all duration-300 animate-in fade-in"
          style={{
            background: 'linear-gradient(176deg, rgba(234, 234, 234, 0.00) 3.17%, #DADADA 81.22%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="w-16 h-16 bg-[#303030] rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 28 28" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.9091 19.8507C15.9091 19.8507 16.4184 21.2101 16.885 21.2952H10.988C9.80005 21.2952 8.7397 20.6155 8.40001 19.3409L4.96371 9.14447C4.96371 9.14447 4.66688 7.91238 4.2002 7.7H10.2245C11.4125 7.74254 12.2185 8.16731 12.6852 9.7394L15.9091 19.8507Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12.1336 19.8509C12.1336 19.8509 11.6244 21.2103 11.1577 21.2954H17.0547C18.2427 21.2954 19.303 20.6157 19.6427 19.3411L23.0368 9.14499C23.0368 9.14499 23.3336 7.9129 23.8003 7.70052H17.8182C16.6303 7.70052 15.8668 8.12529 15.4001 9.69738L12.1336 19.8509Z" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1 font-sans">
              <span className="text-md font-bold text-gray-800">Logging out</span>
              <span className="text-xs text-gray-500">Securing your session...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
