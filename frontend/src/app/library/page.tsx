// src/app/library/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { BookOpen, Folder, FileText, Download, Trash, Plus, Search, Loader2, X, Check, AlertTriangle, ArrowLeft, ChevronRight } from 'lucide-react';
import {
  listLibraryItems,
  uploadLibraryItem,
  deleteLibraryItem,
  LibraryItem
} from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function LibraryPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // File Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      addToast('File size exceeds the 10MB limit.', 'error');
      return;
    }
    setPendingFile(file);
    setUploadCategoryMode('existing');
    setCustomCategoryName('');
    const defaultCategory = activeCategory && activeCategory !== 'Exports' ? activeCategory : 'Reference Materials';
    setSelectedUploadCategory(defaultCategory);
  };

  // File Upload Handlers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    processFile(file);
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

  // File Download Handler
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

  const getCategoryCount = (category: string) => {
    return items.filter(item => item.url && item.category === category).length;
  };

  const totalCount = items.filter(item => item.url).length;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4.5 h-4.5" />
        </div>
      );
    }
    if (ext === 'doc' || ext === 'docx') {
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4.5 h-4.5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-[#10375C]/5 border border-[#10375C]/15/60 text-[#10375C] flex items-center justify-center flex-shrink-0">
        <FileText className="w-4.5 h-4.5" />
      </div>
    );
  };

  // Framer Motion list animation variants
  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } }
  };

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />

        {/* Page Header (Desktop) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2 select-none">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-bold text-slate-800 flex items-center gap-2.5">
              <BookOpen className="w-4.5 h-4.5 text-[#10375C]" />
              <span>Library</span>
            </h2>
            <p className="text-[13px] text-slate-505 font-sans leading-tight">
              Manage your reference documents and AI-generated assessment PDFs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant="primary"
              disabled={loading}
              icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
              onClick={handleUploadClick}
              className="bg-[#10375C] border-0 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-md active:scale-95 cursor-pointer transition-all"
            >
              Upload Material
            </PillButton>
          </div>
        </div>

        {/* Mobile Page Header */}
        <div className="flex md:hidden w-full items-center justify-between relative z-10 px-3">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <h2 className="text-sm font-black text-slate-900 font-sans">Library</h2>
          <div className="w-10 h-10 flex-shrink-0" />
        </div>

        {/* Mobile Upload Button Container */}
        <div className="flex md:hidden items-center justify-end px-3">
          <PillButton
            variant="primary"
            disabled={loading}
            icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
            onClick={handleUploadClick}
            className="w-full justify-center bg-[#10375C] border-0 rounded-2xl py-3.5 text-xs font-bold text-white shadow-md active:scale-95 cursor-pointer"
          >
            Upload Material
          </PillButton>
        </div>

        {/* Smart Categories Bento Grid & Dropzone */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
          {/* Folders List (Col span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Directories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Folder Cards (All Files + Categories) */}
              <div 
                onClick={() => setActiveCategory(null)}
                className={`backdrop-blur-md border rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:scale-[1.01] active:scale-[0.99] group ${
                  activeCategory === null 
                    ? 'border-[#10375C] bg-[#10375C]/10 text-[#10375C] ring-1 ring-[#10375C]/20' 
                    : 'border-slate-200 bg-white/90 hover:bg-white hover:border-orange-500/20 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Folder className={`w-9 h-9 flex-shrink-0 transition-colors ${
                    activeCategory === null ? 'text-[#10375C] fill-orange-500/10' : 'text-slate-400 fill-slate-50 group-hover:text-[#10375C] group-hover:fill-orange-50/50'
                  }`} />
                  <div className="flex flex-col min-w-0 leading-none">
                    <span className="text-sm font-bold truncate text-slate-800 group-hover:text-slate-900">All Documents</span>
                    <span className="text-xs text-slate-400 font-medium mt-1 font-sans">{totalCount} items</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#10375C] group-hover:translate-x-0.5 transition-all" />
              </div>

              {categories.map((cat) => (
                <div 
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`backdrop-blur-md border rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:scale-[1.01] active:scale-[0.99] group ${
                    activeCategory === cat 
                      ? 'border-[#10375C] bg-[#10375C]/10 text-[#10375C] ring-1 ring-[#10375C]/20' 
                      : 'border-slate-200 bg-white/90 hover:bg-white hover:border-orange-500/20 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Folder className={`w-9 h-9 flex-shrink-0 transition-colors ${
                      activeCategory === cat ? 'text-[#10375C] fill-orange-500/10' : 'text-slate-400 fill-slate-50 group-hover:text-[#10375C] group-hover:fill-orange-50/50'
                    }`} />
                    <div className="flex flex-col min-w-0 leading-none">
                      <span className="text-sm font-bold truncate text-slate-800 group-hover:text-slate-900">{cat}</span>
                      <span className="text-xs text-slate-400 font-medium mt-1 font-sans">{getCategoryCount(cat)} items</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#10375C] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Drag & Drop Upload Zone (Col span 1) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Dropzone Upload</h3>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`backdrop-blur-md border border-dashed rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[140px] gap-2.5 group relative overflow-hidden ${
                isDragging 
                  ? 'border-[#10375C] bg-[#10375C]/5 ring-2 ring-[#10375C]/10 shadow-lg shadow-orange-500/5' 
                  : 'border-slate-250 bg-white/90 hover:bg-white hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5'
              }`}
            >
              <div className="p-3 rounded-full bg-[#10375C]/5 border border-[#10375C]/15 text-[#10375C] group-hover:scale-110 group-hover:bg-[#10375C] group-hover:text-white transition-all duration-300 shadow-sm">
                <Plus className="w-4 h-4 transition-colors" />
              </div>
              <div className="flex flex-col gap-0.5 leading-tight">
                <span className="text-sm font-bold text-slate-800 group-hover:text-[#10375C] transition-colors">
                  Upload Document
                </span>
                <span className="text-xs text-slate-400 font-medium font-sans mt-0.5">
                  Drag & drop or click to browse
                </span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans uppercase mt-1.5 tracking-wider">
                  PDF, DOC, DOCX up to 10MB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Tabs & Search Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-2 pl-1 select-none">
            <span className="text-xs font-bold text-slate-700 font-sans">
              {activeCategory ? `Files in "${activeCategory}"` : 'All Library Files'}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md text-slate-500 font-sans">
              {filteredItems.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search library assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl outline-none focus:bg-white focus:border-slate-350 focus:ring-1 focus:ring-slate-200 transition-all font-sans text-slate-800"
            />
          </div>
        </div>

        {/* Files Directory Container */}
        <div className="backdrop-blur-md bg-white/90 border border-slate-200/50 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col font-sans relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#10375C]" />
            </div>
          )}

          {/* Table Headers */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_auto] md:grid-cols-[1fr_140px_120px_100px] gap-4 items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-6 select-none">
            <span>Name</span>
            <span className="hidden sm:inline-block w-36">Type</span>
            <span className="hidden md:inline-block w-28">Size</span>
            <span className="w-24 text-right pr-4">Actions</span>
          </div>

          {/* Directory rows list */}
          <motion.div 
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <motion.div 
                  variants={rowVariants}
                  key={item._id}
                  className="p-4 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_auto] md:grid-cols-[1fr_140px_120px_100px] gap-4 items-center hover:bg-slate-50/50 border-b border-slate-100/60 last:border-b-0 transition-colors text-xs text-slate-800 pl-6"
                >
                  {/* Name field with smart visual icon */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {getFileIcon(item.name)}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => item.type !== 'folder' && handleDownload(item)}
                          className={`font-bold truncate transition-colors ${item.type !== 'folder' ? 'hover:text-[#10375C] cursor-pointer' : ''}`}
                        >
                          {item.name}
                        </span>
                        
                        {/* Compact type badges */}
                        {item.source === 'export' ? (
                          <span className="flex-shrink-0 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50/80 text-indigo-650 border border-indigo-150 tracking-wider">
                            Export
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#10375C]/5 text-[#10375C] border border-orange-150 tracking-wider">
                            Upload
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 font-sans">
                        Category: {item.category} • Updated {item.updatedAt ? item.updatedAt.split('T')[0] : '--'}
                      </span>
                    </div>
                  </div>

                  {/* File Type Column */}
                  <span className="hidden sm:inline-block w-36 text-slate-400 font-medium capitalize font-sans">
                    {item.type}
                  </span>

                  {/* File Size Column */}
                  <span className="hidden md:inline-block w-28 text-slate-400 font-medium font-sans">
                    {item.size || '--'}
                  </span>
                  
                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2.5 w-24 pr-4">
                    {item.type !== 'folder' && (
                      <button 
                        onClick={() => handleDownload(item)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-750 hover:bg-slate-50 hover:text-indigo-600 transition-all hover:scale-105 active:scale-95 border-0 cursor-pointer"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all hover:scale-105 active:scale-95 border-0 cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-50/20">
                <Folder className="w-8 h-8 text-slate-350" />
                <div className="flex flex-col gap-0.5 font-sans">
                  <span className="font-black text-slate-500">No items found</span>
                  <span className="text-slate-400 text-[11px] font-semibold">No assets in your library match these filters.</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

      </div>

      {/* Upload Confirmation Category Picker Modal */}
      <AnimatePresence>
        {pendingFile && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[4px] p-4"
            onClick={() => setPendingFile(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200/50 max-w-lg w-full p-6 md:p-8 flex flex-col gap-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#10375C] flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 font-sans tracking-tight">
                      Configure Library Material
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5">
                      Assign category for this document
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingFile(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File Info Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-150/40 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#10375C]/10 text-[#10375C] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4.5 h-4.5 text-[#10375C]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-700 truncate font-sans">{pendingFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">{(pendingFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>

              {/* Category Selector options */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
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
                      className={`p-3 rounded-xl border text-left text-xs font-bold font-sans transition-all flex items-center justify-between cursor-pointer ${
                        uploadCategoryMode === 'existing' && selectedUploadCategory === cat
                          ? 'border-[#10375C] bg-[#10375C]/5 text-[#10375C] ring-1 ring-[#10375C]/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {uploadCategoryMode === 'existing' && selectedUploadCategory === cat && (
                        <Check className="w-3.5 h-3.5 text-[#10375C] flex-shrink-0 ml-1.5" />
                      )}
                    </button>
                  ))}
                  
                  {/* Custom Category Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setUploadCategoryMode('new');
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-bold font-sans transition-all flex items-center justify-between cursor-pointer ${
                      uploadCategoryMode === 'new'
                        ? 'border-[#10375C] bg-[#10375C]/5 text-[#10375C] ring-1 ring-[#10375C]/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>+ Create Custom</span>
                    {uploadCategoryMode === 'new' && (
                      <Check className="w-3.5 h-3.5 text-[#10375C] flex-shrink-0 ml-1.5" />
                    )}
                  </button>
                </div>

                {/* Custom Category Name Input */}
                {uploadCategoryMode === 'new' && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mock Exam Papers"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-orange-500/50 transition-all font-sans text-slate-800 shadow-inner"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingFile(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-all font-sans border border-slate-200 active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmUpload}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-full transition-all font-sans shadow-md active:scale-95 cursor-pointer border-0"
                >
                  Upload File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[4px] p-4"
            onClick={() => setItemToDelete(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200/50 max-w-md w-full p-6 md:p-8 flex flex-col items-center text-center gap-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-black text-slate-800 font-sans tracking-tight">
                  Delete Library Asset?
                </h3>
                <p className="text-xs text-slate-505 leading-relaxed font-sans px-2">
                  Are you sure you want to permanently delete <strong className="text-slate-700 font-semibold">{itemToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-2.5 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-all font-sans border border-slate-200 active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-all font-sans shadow-md active:scale-95 cursor-pointer border-0"
                >
                  Delete Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
