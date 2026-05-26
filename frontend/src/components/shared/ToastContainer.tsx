'use client';

import React from 'react';
import { useToastStore } from '@/store/toastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 bg-white/95 backdrop-blur-md border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-gray-100/80 transition-all duration-300 transform translate-y-0 scale-100 ${
            toast.type === 'success' 
              ? 'border-l-4 border-l-green-500' 
              : toast.type === 'error' 
              ? 'border-l-4 border-l-red-500' 
              : 'border-l-4 border-l-blue-500'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {toast.type === 'success' && (
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
            )}
            <span className="text-xs font-bold text-gray-800 font-sans leading-tight break-words whitespace-normal overflow-hidden">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black flex-shrink-0 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
