// src/components/layout/TopBar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, Menu, ArrowLeft, LayoutGrid, Sparkle } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    <header className="h-16 bg-white border-b border-veda-card-border px-6 flex items-center justify-between w-full flex-shrink-0 z-30">
      
      {/* Left Title Area (Circular back button + Icon + Title) */}
      <div className="flex items-center gap-3">
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

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-150 transition-colors text-gray-600">
          <Bell className="w-5 h-5" />
          {/* Red notification dot */}
          <Badge dot className="absolute top-1.5 right-1.5" />
        </button>

        {/* Desktop Profile Dropdown */}
        <div className="hidden md:block relative">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
          >
            {/* Custom Yellow Avatar (Matches Figma monkey profile icon) */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
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
            </div>
            
            <span className="text-sm font-semibold text-veda-text-primary">John Doe</span>
            <ChevronDown className="w-4 h-4 text-veda-text-secondary" />
          </button>

          {/* Simple Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-veda-card-border rounded-xl shadow-lg py-2 z-50">
              <Link href="#" className="block px-4 py-2 text-sm text-veda-text-primary hover:bg-gray-50">My Profile</Link>
              <Link href="#" className="block px-4 py-2 text-sm text-veda-text-primary hover:bg-gray-50">Billing</Link>
              <div className="border-t border-veda-card-border my-1"></div>
              <Link href="#" className="block px-4 py-2 text-sm text-veda-orange-red hover:bg-gray-50 font-medium">Log out</Link>
            </div>
          )}
        </div>

        {/* Mobile Avatar icon */}
        <div className="block md:hidden w-8 h-8 rounded-full overflow-hidden border border-gray-200">
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
        </div>

        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={onMenuToggle}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-veda-text-primary block md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

    </header>
  );
}
