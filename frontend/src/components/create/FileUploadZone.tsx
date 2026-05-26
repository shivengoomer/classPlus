// src/components/create/FileUploadZone.tsx
'use client';

import React, { useRef, useState } from 'react';
import { File, X, BookOpen, Loader2, Search, FileText, FolderOpen, Calendar, Info } from 'lucide-react';
import { listLibraryItems, LibraryItem } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  selectedFileUrl: string | null;
  onFileUrlSelect: (url: string | null) => void;
}

export function FileUploadZone({ 
  selectedFile, 
  onFileSelect,
  selectedFileUrl,
  onFileUrlSelect
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addToast } = useToastStore();

  // Pre-fetch library items on mount so we can resolve the filename if fileUrl is pre-selected,
  // and also to avoid loading delay when the user clicks the library button.
  React.useEffect(() => {
    async function prefetchLibrary() {
      try {
        const items = await listLibraryItems();
        // Only show files with actual URLs (excluding local mock folders)
        setLibraryItems(items.filter(item => item.url));
      } catch (err) {
        console.error('Failed to pre-fetch library items:', err);
      }
    }
    prefetchLibrary();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size <= 10 * 1024 * 1024) {
        onFileSelect(file);
      } else {
        addToast('File size exceeds 10MB limit.', 'error');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 10 * 1024 * 1024) {
        onFileSelect(file);
      } else {
        addToast('File size exceeds 10MB limit.', 'error');
      }
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  const removeFileUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileUrlSelect(null);
  };

  const handleToggleLibrary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLibrary(!showLibrary);
    if (!showLibrary) {
      setLoadingLibrary(true);
      try {
        const items = await listLibraryItems();
        // Only show files with actual URLs (excluding local mock folders)
        setLibraryItems(items.filter(item => item.url));
      } catch (err) {
        console.error('Failed to load library items:', err);
      } finally {
        setLoadingLibrary(false);
      }
    }
  };

  // Helper to resolve human readable file name from libraryItems
  const getSelectedFileName = () => {
    if (!selectedFileUrl) return '';
    const matchingItem = libraryItems.find(item => item.url === selectedFileUrl);
    if (matchingItem) return matchingItem.name;
    // Fallback to url basename
    const parts = selectedFileUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart || 'Library Material PDF';
  };
  // Compute categories and filtered items for selection modal
  const categories = Array.from(new Set(libraryItems.map(item => item.category)));
  
  const filteredLibraryItems = libraryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      <label 
        style={{
          color: '#303030',
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          lineHeight: '140%',
          letterSpacing: '-0.64px',
        }}
      >
        Source Materials
      </label>
      
      {selectedFile ? (
        // File Selected View
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-veda-card-border rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-orange-100 rounded-lg text-veda-orange">
              <File className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#303030] truncate font-sans">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-[#303030]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : selectedFileUrl ? (
        // Library Material selected
        <div className="flex items-center justify-between p-4 bg-orange-50/50 border border-veda-orange/25 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-orange-100 rounded-lg text-veda-orange">
              <File className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#303030] truncate font-sans">
                {getSelectedFileName()}
              </span>
              <span className="text-xs text-veda-orange font-sans font-medium">
                Using Library Material (UploadThing)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFileUrl}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-[#303030]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // Dropzone Area
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-6 md:p-8 bg-white transition-all cursor-pointer border-[1.75px] border-dashed border-black/20 rounded-[24px] gap-4 self-stretch ${
            isDragActive 
              ? 'bg-gray-50 border-black/40' 
              : 'hover:bg-gray-50/50'
          }`}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
          />
          
          {/* Upload Icon */}
          <div className="text-black/40">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 28.3334V11.6667M20 11.6667L13.3333 18.3334M20 11.6667L26.6667 18.3334" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M33.3333 33.3334H6.66667" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p 
              style={{
                color: '#303030',
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '140%',
                letterSpacing: '-0.64px',
                textAlign: 'center'
              }}
            >
              Choose a file or drag & drop it here
            </p>
            <p 
              style={{
                color: 'rgba(94, 94, 94, 0.80)',
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '140%',
                letterSpacing: '-0.56px',
                textAlign: 'center'
              }}
            >
              JPEG, PNG, upto 10MB
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onButtonClick}
              className="px-6 py-2 text-sm font-bold text-[#303030] bg-white rounded-full border border-black/10 shadow-sm hover:bg-gray-50 active:scale-95 transition-all font-sans"
            >
              Browse Files
            </button>
            <button
              type="button"
              onClick={handleToggleLibrary}
              className="px-6 py-2 text-sm font-bold text-white bg-[#181818] rounded-full shadow-sm hover:bg-black active:scale-95 transition-all font-sans flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Library</span>
            </button>
          </div>
        </div>
      )}
      {showLibrary && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4 transition-all duration-300"
          onClick={() => setShowLibrary(false)}
        >
          <div 
            className="bg-white/95 border border-white/50 shadow-[0_30px_70px_rgba(0,0,0,0.18)] max-w-2xl w-full rounded-[28px] p-6 md:p-8 flex flex-col gap-6 max-h-[85vh] transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 flex items-center justify-center text-veda-orange shadow-sm flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[18px] font-extrabold text-[#303030] font-sans tracking-tight">
                    Select Library Material
                  </h3>
                  <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                    Choose one of your UploadThing assets to populate source questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Filters & Search */}
            <div className="flex flex-col gap-3">
              {/* Search Bar */}
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search your library documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-10 py-3 bg-gray-50/50 border border-veda-card-border rounded-xl outline-none focus:bg-white focus:border-veda-orange/50 transition-all font-sans text-gray-800 shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none -mx-1 px-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap ${
                      selectedCategory === null
                        ? 'bg-gradient-to-r from-veda-orange to-red-500 text-white border-transparent shadow-sm'
                        : 'bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100'
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap capitalize ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-veda-orange to-red-500 text-white border-transparent shadow-sm'
                          : 'bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body / Scrollable files list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[220px] max-h-[360px] pr-1.5 custom-scrollbar">
              {loadingLibrary ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-gray-500">
                  <Loader2 className="w-7 h-7 animate-spin text-veda-orange" />
                  <span className="font-sans font-medium">Fetching library assets from storage...</span>
                </div>
              ) : filteredLibraryItems.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {filteredLibraryItems.map((item) => {
                    const ext = item.name.split('.').pop()?.toLowerCase();
                    const isPdf = ext === 'pdf';
                    
                    return (
                      <div
                        key={item._id}
                        onClick={() => {
                          if (item.url) {
                            onFileUrlSelect(item.url);
                            setShowLibrary(false);
                          }
                        }}
                        className="group p-4 bg-gray-50/40 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-orange-50/20 hover:border-orange-200/60 cursor-pointer transition-all duration-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            isPdf 
                              ? 'bg-red-50 text-red-500 group-hover:bg-red-100/70' 
                              : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100/70'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 truncate font-sans group-hover:text-veda-orange transition-colors">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-sans">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {item.updatedAt ? item.updatedAt.split('T')[0] : '--'}
                              </span>
                              <span>•</span>
                              <span>{item.size || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-white border border-gray-100/80 px-2.5 py-1 rounded-full text-gray-500 font-extrabold uppercase tracking-wider shadow-sm group-hover:bg-orange-50/50">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <FolderOpen className="w-8 h-8 text-gray-300" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-gray-500 font-sans">No matching files found</p>
                    <p className="text-[10px] text-gray-400 font-sans">Try refining your search text or category filters</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-sans">
                <Info className="w-3.5 h-3.5 text-gray-300" />
                <span>Showing {filteredLibraryItems.length} of {libraryItems.length} library assets</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLibrary(false)}
                  className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all font-sans border border-gray-150 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <span 
        style={{
          color: 'rgba(94, 94, 94, 0.55)',
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '140%',
          letterSpacing: '-0.56px',
          textAlign: 'center',
          marginTop: '4px'
        }}
      >
        Upload images of your preferred document/image
      </span>
    </div>
  );
}
