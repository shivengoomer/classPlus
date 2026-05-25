// src/app/library/page.tsx
'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { BookOpen, Folder, FileText, Download, Trash, Plus, Search } from 'lucide-react';

interface LibraryItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'doc';
  size?: string;
  category: string;
  updatedAt: string;
}

const INITIAL_ITEMS: LibraryItem[] = [
  { id: 'lib-1', name: 'Science Grade 8 - Chapter 14', type: 'folder', category: 'Syllabus Chapters', updatedAt: '2026-05-24' },
  { id: 'lib-2', name: 'English Grade 5 - Prepositions', type: 'folder', category: 'Worksheets', updatedAt: '2026-05-23' },
  { id: 'lib-3', name: 'NCERT Textbook - Electric Effects.pdf', type: 'pdf', size: '2.4 MB', category: 'Syllabus Chapters', updatedAt: '2026-05-20' },
  { id: 'lib-4', name: 'Delhi Public School Exam Instructions.doc', type: 'doc', size: '150 KB', category: 'Reference Materials', updatedAt: '2026-05-18' },
  { id: 'lib-5', name: 'Electricity Chapter 14 Quiz (Final Export).pdf', type: 'pdf', size: '1.2 MB', category: 'Exports', updatedAt: '2026-05-20' },
  { id: 'lib-6', name: 'English Grammar Prepositions Test.pdf', type: 'pdf', size: '890 KB', category: 'Exports', updatedAt: '2026-05-22' }
];

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleDownload = (name: string) => {
    alert(`Downloading ${name}...`);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpload = () => {
    alert('Feature coming soon: Upload new Reference PDF or Chapter syllabus notes');
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-bold text-veda-text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-veda-orange" />
              <span>My Library</span>
            </h2>
            <p className="text-[13px] text-veda-text-secondary">
              Browse reference files, syllabus textbooks, worksheets, and generated PDF assessment answer keys.
            </p>
          </div>
          <PillButton
            variant="primary"
            icon={<Plus className="w-4 h-4 text-white" />}
            onClick={handleUpload}
          >
            Upload Material
          </PillButton>
        </div>

        {/* Categories Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-veda-card-border shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === null
                  ? 'bg-veda-orange text-white shadow-sm'
                  : 'text-veda-text-secondary hover:bg-gray-50 hover:text-veda-text-primary'
              }`}
            >
              All files
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-veda-orange text-white shadow-sm'
                    : 'text-veda-text-secondary hover:bg-gray-50 hover:text-veda-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search library assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-veda-card-border rounded-full outline-none focus:bg-white focus:border-gray-400 transition-colors font-sans text-veda-text-primary"
            />
          </div>
        </div>

        {/* Files Directory Grid */}
        <div className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
          <div className="p-4 border-b border-veda-card-border bg-gray-50 flex justify-between items-center text-xs font-bold text-veda-text-secondary uppercase tracking-wider">
            <span>Name</span>
            <div className="flex items-center gap-16 md:gap-24 mr-4 md:mr-16">
              <span className="hidden sm:inline-block w-24">Type</span>
              <span className="hidden md:inline-block w-24">Size</span>
              <span className="w-24 text-right">Actions</span>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors text-xs text-veda-text-primary"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-veda-orange flex items-center justify-center flex-shrink-0">
                      {item.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-indigo-500 fill-indigo-50/20" />
                      ) : (
                        <FileText className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold truncate hover:text-veda-orange cursor-pointer transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-veda-text-secondary mt-0.5">
                        Category: {item.category} • Updated {item.updatedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-16 md:gap-24 mr-4 md:mr-16 font-sans text-xs">
                    <span className="hidden sm:inline-block w-24 text-gray-500 capitalize">
                      {item.type}
                    </span>
                    <span className="hidden md:inline-block w-24 text-gray-400">
                      {item.size || '--'}
                    </span>
                    
                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 w-24">
                      {item.type !== 'folder' && (
                        <button 
                          onClick={() => handleDownload(item.name)}
                          className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete asset"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-xs text-veda-text-secondary">
                No items in your library match the filters or search parameters.
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
