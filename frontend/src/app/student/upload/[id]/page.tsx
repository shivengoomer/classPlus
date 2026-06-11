// src/app/student/upload/[id]/page.tsx — Paper Upload
'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, X, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { uploadPaper } from '@/lib/studentApi';

export default function UploadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { studentName } = useStudentStore();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError('');
    if (f.size > 20 * 1024 * 1024) {
      setError('File too large. Maximum size is 20MB.');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !studentName) return;
    setUploading(true);
    setError('');
    try {
      await uploadPaper(id, studentName, file);
      setSuccess(true);
      setTimeout(() => router.push('/student/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 font-sans">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Upload Handwritten Paper</h1>
            <p className="text-[10px] text-slate-400">Submit as {studentName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 flex flex-col gap-6">
        <AnimatePresence>
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Paper Uploaded!</h2>
              <p className="text-sm text-slate-500 text-center">Your teacher will review and grade your submission.</p>
              <p className="text-xs text-slate-400">Redirecting to dashboard…</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="text-center flex flex-col gap-2">
                <h2 className="text-xl font-black text-slate-800">Upload Your Answer Sheet</h2>
                <p className="text-sm text-slate-500">Take a clear photo of each page or scan the entire paper as a PDF.</p>
              </div>

              {/* Drop Zone */}
              <div
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all ${
                  dragging
                    ? 'border-indigo-400 bg-indigo-50'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/20'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 rounded-xl shadow-md object-contain" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-indigo-500" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">Drag & drop or click to select</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, or PDF • Max 20MB</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Image className="w-3.5 h-3.5" /> Photo of paper
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <FileText className="w-3.5 h-3.5" /> Scanned PDF
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 flex flex-col gap-1.5">
                <strong className="text-blue-800">📸 Tips for best results:</strong>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>Good lighting with no shadows on your paper</li>
                  <li>Keep the camera parallel to the paper (overhead shot)</li>
                  <li>All written text should be clearly legible</li>
                  <li>Include all pages in a single PDF if possible</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <motion.button
                onClick={handleUpload}
                disabled={!file || uploading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Submit Paper</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
