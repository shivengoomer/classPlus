import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { logError } from '../utils/logger';

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    logError('Failed to list notifications', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;
    const notification = await Notification.findOneAndUpdate({ _id: id, userId }, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    logError('Failed to mark notification as read', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    await Notification.updateMany({ read: false, userId }, { read: true });
    res.json({ success: true });
  } catch (err) {
    logError('Failed to mark all notifications as read', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (err) {
    logError('Failed to delete notification', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    logError('Failed to clear notifications', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
