// src/components/assignments/AssignmentContextMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';

interface AssignmentContextMenuProps {
  onView: () => void;
  onDelete: () => void;
}

export function AssignmentContextMenu({ onView, onDelete }: AssignmentContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-dot trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-classplus-text-secondary hover:text-classplus-text-primary"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-44 bg-white rounded-[16px] p-2 z-30 flex flex-col gap-1 border border-gray-100"
          style={{ boxShadow: '0px 32px 48px rgba(0, 0, 0, 0.05), 0px 16px 48px rgba(0, 0, 0, 0.20)' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView();
            }}
            className="w-full h-8 text-left px-2 rounded-[8px] text-[14px] font-semibold text-[#303030] hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>View Assignment</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="w-full h-8 text-left px-2 rounded-[8px] text-[14px] font-semibold text-[#C53535] bg-[#F6F6F6] hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#C53535]" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
