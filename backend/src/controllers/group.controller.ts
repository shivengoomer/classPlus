// src/controllers/group.controller.ts
import { Request, Response } from 'express';
import { Group } from '../models/group.model';
import { log, logError } from '../utils/logger';

// GET /api/groups
export async function listGroups(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const groups = await Group.find({ userId }).sort({ createdAt: -1 });
    return res.json(groups);
  } catch (err) {
    logError('listGroups failed', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

// POST /api/groups
export async function createGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { name, grade, subject, rubric, students } = req.body;

    if (!name || !grade || !subject) {
      return res.status(400).json({ error: 'name, grade and subject are required' });
    }

    const group = await Group.create({
      name,
      grade,
      subject,
      rubric,
      students: students || [],
      userId,
    });

    log(`Group created: ${group._id} (classCode: ${group.classCode}) for user ${userId}`);
    return res.status(201).json(group);
  } catch (err) {
    logError('createGroup failed', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
}

// PUT /api/groups/:id
export async function updateGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const group = await Group.findOne({ _id: req.params.id, userId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const { name, grade, subject, rubric, students } = req.body;
    if (name !== undefined) group.name = name;
    if (grade !== undefined) group.grade = grade;
    if (subject !== undefined) group.subject = subject;
    if (rubric !== undefined) group.rubric = rubric;
    if (students !== undefined) group.students = students;

    await group.save();
    log(`Group updated: ${group._id} for user ${userId}`);
    return res.json(group);
  } catch (err) {
    logError('updateGroup failed', err);
    return res.status(500).json({ error: 'Failed to update group' });
  }
}

// DELETE /api/groups/:id
export async function deleteGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const group = await Group.findOneAndDelete({ _id: req.params.id, userId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    log(`Group deleted: ${req.params.id} for user ${userId}`);
    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    logError('deleteGroup failed', err);
    return res.status(500).json({ error: 'Failed to delete group' });
  }
}
