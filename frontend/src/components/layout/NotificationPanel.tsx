'use client';

import React from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { X, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface NotificationPanelProps {
  onClose: () => void;
  className?: string;
}

export function NotificationPanel({ onClose, className }: NotificationPanelProps) {
  const { notifications, loading, markAsRead, markAllRead, removeNotification, clearAll, unreadCount } = useNotificationStore();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />;
      case 'error': return <XCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />;
      default: return <Info className="w-4.5 h-4.5 text-blue-500" flex-shrink-0 />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`bg-white border border-slate-200/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] z-[100] flex flex-col overflow-hidden notifications-panel ${className || ''}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 select-none">
          <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-orange-50 text-orange-655 border border-orange-100 px-2 py-0.5 rounded-full font-sans">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {notifications.length > 0 && (
            <button 
              onClick={() => markAllRead()}
              className="text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100/60 px-2.5 py-1 rounded-full border border-orange-100/50 active:scale-95 transition-all cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200/50 transition-colors border-0 bg-transparent cursor-pointer">
            <X className="w-4 h-4 text-slate-400 hover:text-slate-655" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[350px] overflow-y-auto no-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-450 font-bold font-sans">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/40 flex items-center justify-center text-slate-350 shadow-inner">
              <Info className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 font-bold font-sans">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div 
                  key={notif._id}
                  className={`p-4 transition-colors relative group flex gap-3 cursor-pointer ${
                    isUnread 
                      ? 'bg-orange-500/[0.02]' 
                      : 'bg-white opacity-70'
                  } hover:bg-slate-50/60`}
                  onClick={() => {
                    if (isUnread) markAsRead(notif._id);
                    if (notif.link) {
                      router.push(notif.link);
                      onClose();
                    }
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-xs font-bold ${isUnread ? 'text-slate-800' : 'text-slate-600'}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-550 mt-1 leading-relaxed font-sans">
                      {notif.message}
                    </p>
                  </div>
                  
                  {/* Individual Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif._id);
                    }}
                    className="absolute top-3.5 right-3.5 p-1 bg-white hover:bg-rose-50 hover:text-rose-655 border border-slate-200/50 text-slate-400 rounded-lg transition-all active:scale-95 border-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-center flex-shrink-0">
          <button 
            onClick={() => clearAll()}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all history</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
