'use client';

import React from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { X, CheckCircle, Info, AlertTriangle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, loading, markAsRead, markAllRead, removeNotification, clearAll } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-veda-card-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-bold text-[#303030]">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={() => markAllRead()}
              className="text-[11px] font-bold text-veda-orange hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div 
                key={notif._id}
                className={`p-4 transition-colors relative group ${notif.read ? 'bg-white opacity-70' : 'bg-orange-50/30'}`}
                onClick={() => !notif.read && markAsRead(notif._id)}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-sm font-bold truncate ${notif.read ? 'text-[#303030]' : 'text-black'}`}>
                        {notif.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      {notif.link ? (
                        <Link 
                          href={notif.link} 
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-veda-orange hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif._id);
                            onClose();
                          }}
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : <div />}
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Individual Delete Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif._id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-center">
          <button 
            onClick={() => clearAll()}
            className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all history</span>
          </button>
        </div>
      )}
    </div>
  );
}
