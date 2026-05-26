// src/app/library/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { BookOpen, Folder, FileText, Download, Trash, Plus, Search, Loader2, X, Check, AlertTriangle } from 'lucide-react';
import {
  listLibraryItems,
  uploadLibraryItem,
  deleteLibraryItem,
  LibraryItem
} from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

export default function LibraryPage() {
  const { addToast } = useToastStore();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadCategoryMode, setUploadCategoryMode] = useState<'existing' | 'new'>('existing');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('Reference Materials');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load items on mount
  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const data = await listLibraryItems();
        setItems(data);
      } catch (err) {
        console.error('Failed to load library items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const categories = Array.from(new Set(items.filter(item => item.url).map(item => item.category)));

  // File Upload Handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow uploading the same file again if desired
    e.target.value = '';

    setPendingFile(file);
    setUploadCategoryMode('existing');
    setCustomCategoryName('');
    const defaultCategory = activeCategory && activeCategory !== 'Exports' ? activeCategory : 'Reference Materials';
    setSelectedUploadCategory(defaultCategory);
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;

    const category = uploadCategoryMode === 'new' 
      ? customCategoryName.trim() 
      : selectedUploadCategory;

    if (!category) {
      addToast('Please specify a category name', 'error');
      return;
    }

    setLoading(true);
    setPendingFile(null);
    try {
      const newItem = await uploadLibraryItem(pendingFile, category);
      setItems((prev) => [newItem, ...prev]);
      addToast(`Successfully uploaded "${pendingFile.name}"`, 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      addToast('Failed to upload library material. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // File Download Handler (Opens direct URL in new tab to bypass CORS)
  const handleDownload = (item: LibraryItem) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else {
      addToast(`Download URL is not available for ${item.name}`, 'error');
    }
  };

  // File Deletion Handler
  const handleDelete = (id: string) => {
    const item = items.find(i => i._id === id);
    if (item) {
      setItemToDelete(item);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    const targetId = itemToDelete._id;
    const targetName = itemToDelete.name;
    setItemToDelete(null);
    try {
      await deleteLibraryItem(targetId);
      setItems((prev) => prev.filter(item => item._id !== targetId));
      addToast(`Deleted "${targetName}" from library`, 'success');
    } catch (err) {
      console.error('Failed to delete item:', err);
      addToast('Failed to delete library item. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!item.url) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  const existingCategories = Array.from(new Set([
    'Reference Materials',
    'Syllabus Chapters',
    'Worksheets',
    ...items.filter(item => item.url).map(item => item.category)
  ]));

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16">
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />

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
          <div className="flex items-center gap-2">
            <PillButton
              variant="primary"
              disabled={loading}
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
              onClick={handleUploadClick}
            >
              Upload Material
            </PillButton>
          </div>
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
        <div className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col font-sans relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-veda-orange" />
            </div>
          )}

          <div className="p-4 border-b border-veda-card-border bg-gray-50 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_96px_auto] md:grid-cols-[1fr_96px_96px_96px] gap-4 items-center text-xs font-bold text-veda-text-secondary uppercase tracking-wider">
            <span>Name</span>
            <span className="hidden sm:inline-block w-24">Type</span>
            <span className="hidden md:inline-block w-24">Size</span>
            <span className="w-24 text-right pr-4">Actions</span>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div 
                  key={item._id}
                  className="p-4 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_96px_auto] md:grid-cols-[1fr_96px_96px_96px] gap-4 items-center hover:bg-gray-50/50 transition-colors text-xs text-veda-text-primary"
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
                      <span 
                        onClick={() => item.type !== 'folder' && handleDownload(item)}
                        className={`font-semibold truncate transition-colors ${item.type !== 'folder' ? 'hover:text-veda-orange cursor-pointer' : ''}`}
                      >
                        {item.name}
                      </span>
                      <span className="text-[10px] text-veda-text-secondary mt-0.5">
                        Category: {item.category} • Updated {item.updatedAt ? item.updatedAt.split('T')[0] : '--'}
                      </span>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block w-24 text-gray-500 capitalize">
                    {item.type}
                  </span>
                  <span className="hidden md:inline-block w-24 text-gray-400">
                    {item.size || '--'}
                  </span>
                  
                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 w-24 pr-4">
                    {item.type !== 'folder' && (
                      <button 
                        onClick={() => handleDownload(item)}
                        className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete asset"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-xs text-veda-text-secondary flex flex-col items-center justify-center gap-3 bg-gray-50/20">
                <Folder className="w-8 h-8 text-gray-300" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-gray-500">No items found</span>
                  <span className="text-gray-400 text-[11px]">No items in your library match the filters or search parameters.</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Upload Confirmation Category Picker Modal */}
      {pendingFile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          onClick={() => setPendingFile(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-veda-card-border max-w-lg w-full p-6 md:p-8 flex flex-col gap-5 shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-veda-orange flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 font-sans">
                    Configure Library Material
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Choose a category or create a custom one for this document
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File Info Card */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100/50 text-veda-orange flex items-center justify-center flex-shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-700 truncate font-sans">{pendingFile.name}</span>
                <span className="text-[10px] text-gray-400 font-sans mt-0.5">{(pendingFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>

            {/* Category Selector options */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Document Category
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {existingCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setUploadCategoryMode('existing');
                      setSelectedUploadCategory(cat);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold font-sans transition-all flex items-center justify-between ${
                      uploadCategoryMode === 'existing' && selectedUploadCategory === cat
                        ? 'border-veda-orange bg-orange-50/20 text-veda-orange ring-1 ring-veda-orange'
                        : 'border-gray-150 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {uploadCategoryMode === 'existing' && selectedUploadCategory === cat && (
                      <Check className="w-3.5 h-3.5 text-veda-orange flex-shrink-0 ml-1.5" />
                    )}
                  </button>
                ))}
                
                {/* Custom Category Button */}
                <button
                  type="button"
                  onClick={() => {
                    setUploadCategoryMode('new');
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold font-sans transition-all flex items-center justify-between ${
                    uploadCategoryMode === 'new'
                      ? 'border-veda-orange bg-orange-50/20 text-veda-orange ring-1 ring-veda-orange'
                      : 'border-gray-150 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>+ Create Custom</span>
                  {uploadCategoryMode === 'new' && (
                    <Check className="w-3.5 h-3.5 text-veda-orange flex-shrink-0 ml-1.5" />
                  )}
                </button>
              </div>

              {/* Custom Category Name Input */}
              {uploadCategoryMode === 'new' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold text-gray-400 font-sans">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mock Exam Papers"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl outline-none focus:bg-white focus:border-veda-orange/50 transition-all font-sans text-gray-800 shadow-inner"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all font-sans border border-gray-150 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUpload}
                className="px-5 py-2 text-xs font-bold text-white bg-[#181818] hover:bg-black rounded-full transition-all font-sans shadow-md active:scale-95"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-veda-card-border max-w-md w-full p-6 md:p-8 flex flex-col items-center text-center gap-5 shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-inner flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[18px] font-extrabold text-[#303030] font-sans tracking-tight">
                Delete Library Asset?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans px-2">
                Are you sure you want to permanently delete <strong className="text-gray-700 font-semibold">{itemToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 w-full mt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all font-sans border border-gray-150 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all font-sans shadow-md active:scale-95"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
