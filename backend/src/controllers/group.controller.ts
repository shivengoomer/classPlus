// src/controllers/group.controller.ts
import { Request, Response } from 'express';
import { Group } from '../models/group.model';
import { StudentCredential } from '../models/studentCredential.model';
import { log, logError } from '../utils/logger';
import crypto from 'crypto';

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
      institutionId: (req as any).user?.institutionId,
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

// GET /api/groups/:id/roster
export async function getGroupRoster(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const groupId = req.params.id;

    const group = await Group.findOne({ _id: groupId, userId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Find all credentials linked to this group
    const credentials = await StudentCredential.find({ groupIds: group._id });
    const credMap = new Map<string, any>();
    credentials.forEach(cred => {
      credMap.set(cred.studentName.toLowerCase().trim(), cred);
    });

    const roster = group.students.map(studentName => {
      const match = credMap.get(studentName.toLowerCase().trim());
      if (match) {
        return {
          name: studentName,
          isRegistered: true,
          studentId: match._id,
          email: match.email,
          createdAt: match.createdAt,
        };
      }
      return {
        name: studentName,
        isRegistered: false,
      };
    });

    return res.json(roster);
  } catch (err) {
    logError('getGroupRoster failed', err);
    return res.status(500).json({ error: 'Failed to fetch group roster' });
  }
}

// POST /api/groups/:id/students/:studentId/reset-pin
export async function resetStudentPin(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { id: groupId, studentId } = req.params;

    const group = await Group.findOne({ _id: groupId, userId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const credential = await StudentCredential.findOne({ _id: studentId, groupIds: group._id });
    if (!credential) {
      return res.status(404).json({ error: 'Student registration not found in this group' });
    }

    // Generate a temporary 4-digit PIN
    const tempPin = Math.floor(1000 + Math.random() * 9000).toString(); // e.g. "4932"
    const salt = credential.email;
    const hashed = crypto.createHash('sha256').update(tempPin + salt).digest('hex');

    credential.hashedPasscode = hashed;
    await credential.save();

    log(`PIN reset for student ${credential.studentName} (${credential.email}) by teacher ${userId}. Temp PIN: ${tempPin}`);

    return res.json({
      message: 'PIN code reset successfully.',
      tempPin,
    });
  } catch (err) {
    logError('resetStudentPin failed', err);
    return res.status(500).json({ error: 'Failed to reset student PIN code' });
  }
}

// POST /api/groups/:id/students/:studentId/parent-invite
export async function generateParentInvite(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { id: groupId, studentId } = req.params;

    const group = await Group.findOne({ _id: groupId, userId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const credential = await StudentCredential.findOne({ _id: studentId, groupIds: group._id });
    if (!credential) {
      return res.status(404).json({ error: 'Student registration not found in this group' });
    }

    // Generate a unique 6-character alphanumeric parent invite code (reusing the group code style)
    const crypto = require('crypto');
    let inviteCode = '';
    let isUnique = false;

    // Retry loop to ensure invite code uniqueness in database
    for (let attempts = 0; attempts < 5; attempts++) {
      inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const duplicate = await StudentCredential.findOne({ parentInviteCode: inviteCode });
      if (!duplicate) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      inviteCode = `P${Date.now().toString().slice(-5)}`; // Fallback guarantee
    }

    credential.parentInviteCode = inviteCode;
    await credential.save();

    log(`Parent invite code generated for student ${credential.studentName} (${credential.email}) by teacher ${userId}: ${inviteCode}`);

    return res.json({
      message: 'Parent invite code generated successfully.',
      inviteCode,
    });
  } catch (err) {
    logError('generateParentInvite failed', err);
    return res.status(500).json({ error: 'Failed to generate parent invite code' });
  }
}
