import { Request, Response } from 'express';
import { Announcement } from '../models/announcement.model';
import { Group } from '../models/group.model';
import { logError } from '../utils/logger';

// GET /api/announcements/group/:groupId
export async function listAnnouncements(req: Request, res: Response) {
  try {
    const { groupId } = req.params;
    
    // Authorization Check:
    // If student, check if group is in their authorized groupIds list
    const student = (req as any).student;
    const user = (req as any).user;

    if (student) {
      const isEnrolled = student.groupIds.some((id: string) => id.toString() === groupId);
      if (!isEnrolled) {
        return res.status(403).json({ error: 'Access denied. You are not enrolled in this class.' });
      }
    } else if (user) {
      // If teacher, check if they own the group
      const group = await Group.findOne({ _id: groupId, userId: user.clerkId });
      if (!group) {
        return res.status(403).json({ error: 'Access denied. You do not manage this class.' });
      }
    } else {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const announcements = await Announcement.find({ groupId })
      .sort({ createdAt: -1 });

    return res.json(announcements);
  } catch (err) {
    logError('listAnnouncements failed', err);
    return res.status(500).json({ error: 'Failed to retrieve announcements.' });
  }
}

// POST /api/announcements
export async function createAnnouncement(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { groupId, title, content, attachments } = req.body;
    if (!groupId || !title || !content) {
      return res.status(400).json({ error: 'groupId, title, and content are required.' });
    }

    // Verify teacher manages this class
    const group = await Group.findOne({ _id: groupId, userId: user.clerkId });
    if (!group) {
      return res.status(403).json({ error: 'Access denied. You do not manage this class.' });
    }

    const teacherName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

    const announcement = await Announcement.create({
      groupId,
      teacherId: user.clerkId,
      teacherName,
      title,
      content,
      attachments: attachments || [],
    });

    return res.status(201).json(announcement);
  } catch (err) {
    logError('createAnnouncement failed', err);
    return res.status(500).json({ error: 'Failed to create announcement.' });
  }
}

// DELETE /api/announcements/:id
export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    // Verify user owns the group or is an admin of the institution
    const group = await Group.findById(announcement.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Class group not found.' });
    }

    const isOwner = group.userId === user.clerkId;
    const isAdmin = user.role === 'Admin' && user.institutionId?.toString() === group.userId; // Mock check or admin of same inst

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Announcement deleted successfully.' });
  } catch (err) {
    logError('deleteAnnouncement failed', err);
    return res.status(500).json({ error: 'Failed to delete announcement.' });
  }
}
