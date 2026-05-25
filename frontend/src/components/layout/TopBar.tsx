// src/components/layout/TopBar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, ChevronDown, Menu } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface TopBarProps {
  title?: string;
  backPath?: string;
  onMenuToggle?: () => void;
}

export function TopBar({ title = 'Assignments', backPath, onMenuToggle }: TopBarProps) {
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-veda-card-border px-6 flex items-center justify-between w-full flex-shrink-0">
      
      {/* Desktop Breadcrumb/Title Area (Hidden on Mobile) */}
      <div className="hidden md:flex items-center gap-3">
        {backPath && (
          <button 
            onClick={() => router.push(backPath)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors text-veda-text-primary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-veda-text-primary">
          {title}
        </h1>
      </div>

      {/* Mobile Top Bar branding (Hidden on Desktop) */}
      <div className="flex md:hidden items-center gap-2">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-veda-orange to-veda-orange-red flex items-center justify-center font-bold text-white text-sm">
          V
        </div>
        <span className="text-lg font-bold text-veda-text-primary">VedaAI</span>
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-veda-text-secondary">
          <Bell className="w-5 h-5" />
          {/* Red notification dot */}
          <Badge dot className="absolute top-1.5 right-1.5" />
        </button>

        {/* Desktop Profile Dropdown (Hidden on Mobile) */}
        <div className="hidden md:block relative">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-veda-btn-primary text-white flex items-center justify-center font-bold text-xs">
              JD
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

        {/* Mobile Avatar */}
        <div className="block md:hidden w-7 h-7 rounded-full bg-veda-btn-primary text-white flex items-center justify-center font-bold text-[10px]">
          JD
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
