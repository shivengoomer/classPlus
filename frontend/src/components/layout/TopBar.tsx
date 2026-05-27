// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, Menu, ArrowLeft, LayoutGrid, Sparkle } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationPanel } from './NotificationPanel';

import { useUser, useClerk } from '@clerk/nextjs';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user } = useUser();
  const { signOut } = useClerk();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User' : 'John Doe';

  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Check if we are in the Create flow to display "Create New" with Sparkle icon
  const isCreateFlow = pathname.includes('/create') || pathname.includes('/status') || pathname.includes('/result');
  const titleText = isCreateFlow ? 'Create New' : 'Assignment';

  // Back navigation path helper
  const handleBack = () => {
    if (pathname === '/assignments') {
      router.push('#'); // assignments list doesn't need to go back, but can reload
    } else {
      router.push('/assignments');
    }
  };

  return (
    <header 
      className="flex items-center justify-between rounded-[16px] bg-white md:bg-white/75 border border-veda-card-border z-30 shadow-sm mx-auto w-full max-w-[373px] md:max-w-[1100px] h-[56px] pl-[12px] pr-[16px] md:pl-[24px] md:pr-[12px] gap-[10px] shrink-0"
    >
      {/* 1. Desktop Left Title Area (Circular back button + Icon + Title) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Circular Back Button (Figma Match) */}
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Dynamic Page Icon + Title */}
        <div className="flex items-center gap-2 text-veda-text-primary ml-1">
          {isCreateFlow ? (
            <Sparkle className="w-5 h-5 text-veda-orange fill-veda-orange" />
          ) : (
            <LayoutGrid className="w-5 h-5 text-gray-700" />
          )}
          <span className="text-[14px] font-bold text-gray-500 tracking-tight">
            {titleText}
          </span>
        </div>
      </div>

      {/* 2. Mobile Left Brand Area (Logo + Brand Name) */}
      <div className="flex md:hidden items-center gap-2">
        <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}>
          <svg
            width="80"
            height="71"
            viewBox="0 0 80 71"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{
              position: 'absolute',
              left: '-20px',
              top: '-2px',
              maxWidth: 'none',
            }}
          >
            <rect x="19.7142" y="1.85519" width="40" height="40" rx="10" fill="url(#paint0_linear_topbar)" />
            <rect x="19.7142" y="1.85519" width="40" height="40" rx="10" fill="url(#pattern0_topbar)" />
            <g filter="url(#filter0_topbar)">
              <path fillRule="evenodd" clipRule="evenodd" d="M42.4413 30.2153C42.4413 30.2153 43.1688 32.1573 43.8355 32.2789H35.4112C33.7141 32.2789 32.1993 31.3079 31.714 29.487L26.805 14.9207C26.805 14.9207 26.381 13.1606 25.7143 12.8571H34.3204C36.0176 12.9179 37.1691 13.5247 37.8357 15.7706L42.4413 30.2153Z" fill="white" />
              <path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M42.4413 30.2153C42.4413 30.2153 43.1688 32.1573 43.8355 32.2789H35.4112C33.7141 32.2789 32.1993 31.3079 31.714 29.487L26.805 14.9207C26.805 14.9207 26.381 13.1606 25.7143 12.8571H34.3204C36.0176 12.9179 37.1691 13.5247 37.8357 15.7706L42.4413 30.2153Z" fill="url(#paint1_linear_topbar)" />
              <path fillRule="evenodd" clipRule="evenodd" d="M37.0471 30.2149C37.0471 30.2149 36.3196 32.1569 35.6529 32.2784H44.0772C45.7743 32.2784 47.2891 31.3074 47.7744 29.4865L52.6231 14.9207C52.6231 14.9207 53.0471 13.1606 53.7138 12.8571H45.168C43.4709 12.8571 42.3801 13.464 41.7135 15.7098L37.0471 30.2149Z" fill="white" />
            </g>
            <defs>
              <pattern id="pattern0_topbar" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlinkHref="#image0_topbar" transform="matrix(0.00075557 0 0 0.000752315 -0.212019 -0.330216)" />
              </pattern>
              <filter id="filter0_topbar" x="0" y="9.53674e-07" width="79.4281" height="70.8503" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="12.8571" />
                <feGaussianBlur stdDeviation="12.8571" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_topbar" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="8.57143" />
                <feGaussianBlur stdDeviation="8.57143" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                <feBlend mode="normal" in2="effect1_dropShadow_topbar" result="effect2_dropShadow_topbar" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="4.28571" />
                <feGaussianBlur stdDeviation="4.28571" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="effect2_dropShadow_topbar" result="effect3_dropShadow_topbar" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_topbar" result="shape" />
              </filter>
              <linearGradient id="paint0_linear_topbar" x1="39.7142" y1="1.85519" x2="39.7142" y2="41.8552" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E56820" />
                <stop offset="1" stopColor="#D45E3E" />
              </linearGradient>
              <linearGradient id="paint1_linear_topbar" x1="34.7749" y1="11.2061" x2="34.7749" y2="33.9908" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="0.33" stopColor="white" stopOpacity="0" />
                <stop offset="0.76" stopColor="#0E1513" />
                <stop offset="1" stopColor="#0E1513" />
              </linearGradient>
            </defs>
          </svg>
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
          VedaAI
        </span>
      </div>

      {/* 3. Desktop Right Side Icons & Profile */}
      <div className="hidden md:flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors text-gray-600 ${showNotifications ? 'bg-gray-150' : 'hover:bg-gray-150'}`}
          >
            <Bell className="w-5 h-5" />
            {/* Red notification dot */}
            {unreadCount > 0 && (
              <Badge 
                count={unreadCount} 
                className="absolute -top-0.5 -right-0.5" 
              />
            )}
          </button>

          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Desktop Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
          >
            {/* Custom Yellow Avatar or Clerk User Image */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center bg-gray-50">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#FDE68A" />
                  <circle cx="16" cy="15" r="7" fill="#D97706" />
                  <circle cx="13" cy="14" r="2.5" fill="#FEE2E2" />
                  <circle cx="19" cy="14" r="2.5" fill="#FEE2E2" />
                  <circle cx="13" cy="14" r="0.75" fill="#111111" />
                  <circle cx="19" cy="14" r="0.75" fill="#111111" />
                  <rect x="11" y="12.5" width="4.5" height="3" rx="1" stroke="#111111" strokeWidth="1" fill="transparent" />
                  <rect x="16.5" y="12.5" width="4.5" height="3" rx="1" stroke="#111111" strokeWidth="1" fill="transparent" />
                  <line x1="15.5" y1="14" x2="16.5" y2="14" stroke="#111111" strokeWidth="1" />
                  <path d="M14 18C14 18 15 19 16 19C17 19 18 18 18 18" stroke="#111111" strokeWidth="1" strokeLinecap="round" />
                </svg>
              )}
            </div>
            
            <span className="text-sm font-semibold text-veda-text-primary">{userName}</span>
            <ChevronDown className="w-4 h-4 text-veda-text-secondary" />
          </button>

          {/* Simple Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-veda-card-border rounded-xl shadow-lg py-2 z-50">
              <Link href="/settings" className="block px-4 py-2 text-sm text-veda-text-primary hover:bg-gray-50" onClick={() => setShowUserDropdown(false)}>My Profile</Link>
              <Link href="/billing" className="block px-4 py-2 text-sm text-veda-text-primary hover:bg-gray-50" onClick={() => setShowUserDropdown(false)}>Billing</Link>
              <div className="border-t border-veda-card-border my-1"></div>
              <button 
                onClick={async () => {
                  setShowUserDropdown(false);
                  await signOut();
                  router.push('/sign-in');
                }}
                className="w-full text-left block px-4 py-2 text-sm text-veda-orange-red hover:bg-gray-50 font-medium"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Mobile Right Side Icons & Profile (Bell icon, User avatar, Hamburger icon) */}
      <div className="flex md:hidden items-center gap-4">
        {/* Mobile Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex-shrink-0 relative p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 flex-shrink-0">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#303030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#303030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Red notification dot */}
            {unreadCount > 0 && (
              <Badge 
                count={unreadCount} 
                className="absolute -top-0.5 -right-0.5" 
              />
            )}
          </button>

          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Mobile User Avatar */}
        <div className="flex w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-[#F6F6F6] justify-center items-center gap-[10px] aspect-square flex-shrink-0">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#FDE68A" />
              <circle cx="12" cy="11.25" r="5.25" fill="#D97706" />
              <circle cx="9.75" cy="10.5" r="1.875" fill="#FEE2E2" />
              <circle cx="14.25" cy="10.5" r="1.875" fill="#FEE2E2" />
              <circle cx="9.75" cy="10.5" r="0.56" fill="#111111" />
              <circle cx="14.25" cy="10.5" r="0.56" fill="#111111" />
              <rect x="8.25" y="9.375" width="3.375" height="2.25" rx="0.75" stroke="#111111" strokeWidth="0.75" fill="transparent" />
              <rect x="12.375" y="9.375" width="3.375" height="2.25" rx="0.75" stroke="#111111" strokeWidth="0.75" fill="transparent" />
              <line x1="11.625" y1="10.5" x2="12.375" y2="10.5" stroke="#111111" strokeWidth="0.75" />
              <path d="M10.5 13.5C10.5 13.5 11.25 14.25 12 14.25C12.75 14.25 13.5 13.5 13.5 13.5" stroke="#111111" strokeWidth="0.75" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={onMenuToggle}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-veda-text-primary flex-shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
