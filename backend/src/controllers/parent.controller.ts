// src/controllers/parent.controller.ts
import { Request, Response } from 'express';
import { StudentCredential } from '../models/studentCredential.model';
import { ParentLink } from '../models/parentLink.model';
import { Group } from '../models/group.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { StudentSubmission } from '../models/studentSubmission.model';
import { Announcement } from '../models/announcement.model';
import { log, logError } from '../utils/logger';

// POST /api/parent/link
// body: { inviteCode, relationship }
export async function linkChildToParent(req: Request, res: Response) {
  try {
    const parentId = (req as any).user?._id;
    if (!parentId) {
      return res.status(401).json({ error: 'Unauthorized. Parent account required.' });
    }

    const { inviteCode, relationship = 'Guardian' } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }

    const student = await StudentCredential.findOne({
      parentInviteCode: inviteCode.toUpperCase().trim(),
    });

    if (!student) {
      return res.status(404).json({ error: 'Invalid invite code. Student not found.' });
    }

    // Check if link already exists
    const existing = await ParentLink.findOne({ parentId, studentId: student._id });
    if (existing) {
      return res.status(409).json({ error: 'This child is already linked to your account.' });
    }

    const link = await ParentLink.create({
      parentId,
      studentId: student._id,
      relationship,
    });

    log(`Parent ${(req as any).user.email} linked to student ${student.studentName} (${student._id})`);

    return res.status(201).json({
      message: 'Child linked successfully.',
      student: {
        _id: student._id,
        studentName: student.studentName,
        email: student.email,
      },
    });
  } catch (err) {
    logError('linkChildToParent failed', err);
    return res.status(500).json({ error: 'Failed to link child.' });
  }
}

// GET /api/parent/children
export async function listLinkedChildren(req: Request, res: Response) {
  try {
    const parentId = (req as any).user?._id;
    if (!parentId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const links = await ParentLink.find({ parentId }).populate('studentId');
    const children = links
      .map(link => link.studentId)
      .filter(Boolean); // Filter out any deleted students

    return res.json(children);
  } catch (err) {
    logError('listLinkedChildren failed', err);
    return res.status(500).json({ error: 'Failed to retrieve children list.' });
  }
}

// GET /api/parent/children/:studentId/dashboard
export async function getParentChildDashboard(req: Request, res: Response) {
  try {
    const parentId = (req as any).user?._id;
    const { studentId } = req.params;

    if (!parentId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Verify parent is linked to this student
    const link = await ParentLink.findOne({ parentId, studentId });
    if (!link) {
      return res.status(403).json({ error: 'Access denied. You are not linked to this student.' });
    }

    const student = await StudentCredential.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Find all groups the student is enrolled in
    const groups = await Group.find({ _id: { $in: student.groupIds } });

    // Fetch all assigned assignments for all these groups
    const assigned = await AssignedAssignment.find({ groupId: { $in: student.groupIds } })
      .populate('assignmentId', 'title subject grade totalMarks status')
      .sort({ createdAt: -1 });

    // Fetch submissions for the student
    const assignedWithStatus = await Promise.all(
      assigned.map(async (a) => {
        const submission = await StudentSubmission.findOne({
          assignedAssignmentId: a._id,
          $or: [
            { studentId: student._id },
            { studentName: student.studentName }
          ]
        }).select('totalScore totalMarks submittedAt autoSubmitted status');

        return {
          _id: a._id,
          assignment: a.assignmentId,
          groupId: a.groupId,
          dueDate: a.dueDate,
          hintsEnabled: a.hintsEnabled,
          durationMinutes: a.durationMinutes,
          submission: submission || null,
        };
      })
    );

    // Fetch announcements for the student's groups
    const announcements = await Announcement.find({ groupId: { $in: student.groupIds } })
      .sort({ createdAt: -1 });

    return res.json({
      student: {
        _id: student._id,
        studentName: student.studentName,
        email: student.email,
      },
      groups: groups.map(g => ({
        _id: g._id,
        name: g.name,
        grade: g.grade,
        subject: g.subject,
        classCode: g.classCode,
      })),
      assignments: assignedWithStatus,
      announcements,
    });
  } catch (err) {
    logError('getParentChildDashboard failed', err);
    return res.status(500).json({ error: 'Failed to retrieve child dashboard details.' });
  }
}
