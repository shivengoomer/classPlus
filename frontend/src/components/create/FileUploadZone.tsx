// src/components/create/FileUploadZone.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export function FileUploadZone({ selectedFile, onFileSelect }: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

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
      // Validate file size (10MB)
      if (file.size <= 10 * 1024 * 1024) {
        onFileSelect(file);
      } else {
        alert('File size exceeds 10MB limit.');
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
        alert('File size exceeds 10MB limit.');
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-veda-text-primary">
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
              <span className="text-sm font-semibold text-veda-text-primary truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-veda-text-secondary">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors text-veda-text-secondary hover:text-veda-text-primary"
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
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-[#F9FAFB] transition-all cursor-pointer ${
            isDragActive 
              ? 'border-veda-orange bg-orange-50/30' 
              : 'border-gray-300 hover:border-gray-400'
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
          
          <div className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-veda-text-secondary mb-3">
            <Upload className="w-5 h-5 text-veda-orange" />
          </div>

          <p className="text-sm font-semibold text-veda-text-primary mb-1">
            Choose a file or drag & drop it here
          </p>
          <p className="text-xs text-veda-text-secondary mb-3">
            JPEG, PNG, PDF up to 10MB
          </p>

          <button
            type="button"
            className="px-4 py-1.5 text-xs font-semibold text-veda-text-primary bg-white border border-veda-card-border rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            Browse Files
          </button>
        </div>
      )}
      
      <span className="text-xs text-veda-text-hint mt-1 pl-1">
        Upload images or documents of your preferred reference content
      </span>
    </div>
  );
}
