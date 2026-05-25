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
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-veda-text-secondary hover:text-veda-text-primary"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-veda-card-border rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView();
            }}
            className="w-full text-left px-4 py-2 text-sm text-veda-text-primary hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4 text-veda-text-secondary" />
            <span>View Assignment</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="w-full text-left px-4 py-2 text-sm text-veda-orange-red hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4 text-veda-orange-red" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
