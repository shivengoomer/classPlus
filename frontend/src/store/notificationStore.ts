import { create } from 'zustand';
import { Notification } from '@/types/notification';
import { 
  listNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  clearAllNotifications 
} from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await listNotifications();
      set({ 
        notifications: data, 
        unreadCount: data.filter((n: Notification) => !n.read).length,
        loading: false 
      });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await markNotificationAsRead(id);
      const updated = get().notifications.map((n) => 
        n._id === id ? { ...n, read: true } : n
      );
      set({ 
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsAsRead();
      const updated = get().notifications.map((n) => ({ ...n, read: true }));
      set({ 
        notifications: updated,
        unreadCount: 0
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  },

  removeNotification: async (id) => {
    try {
      await deleteNotification(id);
      const updated = get().notifications.filter((n) => n._id !== id);
      set({ 
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  },

  clearAll: async () => {
    try {
      await clearAllNotifications();
      set({ notifications: [], unreadCount: 0 });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  },
}));
