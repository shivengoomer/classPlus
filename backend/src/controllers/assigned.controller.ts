// src/controllers/assigned.controller.ts
import { Request, Response } from 'express';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { Group } from '../models/group.model';
import { Assignment } from '../models/assignment.model';
import { StudentSubmission } from '../models/studentSubmission.model';
import { log, logError } from '../utils/logger';

// GET /api/assigned — all assigned assignments for the teacher
export async function listAssigned(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const groups = await Group.find({ userId }).select('_id');
    const groupIds = groups.map((g) => g._id);

    const assigned = await AssignedAssignment.find({ groupId: { $in: groupIds } })
      .populate('assignmentId', 'title subject grade totalMarks pdfUrl')
      .populate('groupId', 'name grade subject classCode students')
      .sort({ createdAt: -1 });

    const assignedWithCount = await Promise.all(assigned.map(async (a) => {
      const submissionCount = await StudentSubmission.countDocuments({ assignedAssignmentId: a._id });
      return {
        ...a.toObject(),
        submissionCount,
      };
    }));

    return res.json(assignedWithCount);
  } catch (err) {
    logError('listAssigned failed', err);
    return res.status(500).json({ error: 'Failed to fetch assigned assignments' });
  }
}

// POST /api/assigned — assign an assessment to a group
export async function createAssigned(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { assignmentId, groupId, dueDate, hintsEnabled, durationMinutes } = req.body;

    if (!assignmentId || !groupId || !dueDate) {
      return res.status(400).json({ error: 'assignmentId, groupId and dueDate are required' });
    }

    // Verify both belong to this teacher
    const [assignment, group] = await Promise.all([
      Assignment.findOne({ _id: assignmentId, userId }),
      Group.findOne({ _id: groupId, userId }),
    ]);

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const assigned = await AssignedAssignment.create({
      assignmentId,
      groupId,
      dueDate,
      hintsEnabled: hintsEnabled ?? false,
      durationMinutes: durationMinutes ?? null,
      userId,
    });

    await assigned.populate('assignmentId', 'title subject grade totalMarks pdfUrl');
    await assigned.populate('groupId', 'name grade subject classCode students');

    log(`Assignment ${assignmentId} assigned to group ${groupId} by user ${userId}`);
    return res.status(201).json(assigned);
  } catch (err) {
    logError('createAssigned failed', err);
    return res.status(500).json({ error: 'Failed to assign assignment' });
  }
}

// GET /api/assigned/:id
export async function getAssigned(req: Request, res: Response) {
  try {
    const assigned = await AssignedAssignment.findById(req.params.id)
      .populate('assignmentId')
      .populate('groupId', 'name grade subject classCode students');

    if (!assigned) return res.status(404).json({ error: 'Assigned assignment not found' });
    return res.json(assigned);
  } catch (err) {
    logError('getAssigned failed', err);
    return res.status(500).json({ error: 'Failed to fetch assigned assignment' });
  }
}

// DELETE /api/assigned/:id
export async function deleteAssigned(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const groups = await Group.find({ userId }).select('_id');
    const groupIds = groups.map((g) => g._id.toString());

    const assigned = await AssignedAssignment.findById(req.params.id).populate<{ groupId: { _id: any } }>('groupId', '_id');
    if (!assigned || !groupIds.includes(assigned.groupId._id.toString())) {
      return res.status(404).json({ error: 'Assigned assignment not found' });
    }

    await assigned.deleteOne();
    log(`Assigned assignment ${req.params.id} deleted by user ${userId}`);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    logError('deleteAssigned failed', err);
    return res.status(500).json({ error: 'Failed to delete assigned assignment' });
  }
}

// GET /api/assigned/:id/submissions
export async function getAssignedSubmissions(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const assignedId = req.params.id;

    // Verify assigned assignment belongs to teacher
    const assigned = await AssignedAssignment.findById(assignedId);
    if (!assigned) {
      return res.status(404).json({ error: 'Assigned assignment not found' });
    }
    const group = await Group.findOne({ _id: assigned.groupId, userId });
    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const submissions = await StudentSubmission.find({ assignedAssignmentId: assignedId })
      .select('studentName totalScore totalMarks submittedAt autoSubmitted answers')
      .sort({ submittedAt: -1 });

    return res.json(submissions);
  } catch (err) {
    logError('getAssignedSubmissions failed', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

// PUT /api/assigned/:id/submissions/:studentName
export async function updateStudentSubmission(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { id: assignedId } = req.params;
    const studentName = String(req.params.studentName || '').trim();
    const { totalScore, answers, totalMarks } = req.body;

    if (!studentName) {
      return res.status(400).json({ error: 'studentName parameter is required' });
    }

    // Verify assigned assignment belongs to teacher
    const assigned = await AssignedAssignment.findById(assignedId);
    if (!assigned) {
      return res.status(404).json({ error: 'Assigned assignment not found' });
    }
    const group = await Group.findOne({ _id: assigned.groupId, userId });
    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find or create submission
    let submission = await StudentSubmission.findOne({
      assignedAssignmentId: assignedId,
      studentName,
    });

    if (!submission) {
      submission = new StudentSubmission({
        assignedAssignmentId: assignedId,
        studentName,
        submittedAt: new Date(),
        startedAt: new Date(),
        answers: [],
      });
    }

    if (totalScore !== undefined) {
      submission.totalScore = totalScore;
    }
    if (totalMarks !== undefined) {
      submission.totalMarks = totalMarks;
    }

    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const existingAns = submission.answers.find(a => a.questionId === ans.questionId);
        if (existingAns) {
          if (ans.marks !== undefined) existingAns.marks = ans.marks;
          if (ans.isCorrect !== undefined) existingAns.isCorrect = ans.isCorrect;
          if (ans.aiFeedback !== undefined) existingAns.aiFeedback = ans.aiFeedback;
          if (ans.answer !== undefined) existingAns.answer = ans.answer;
        } else {
          submission.answers.push({
            questionId: ans.questionId,
            answer: ans.answer || '',
            isCorrect: ans.isCorrect || false,
            marks: ans.marks || 0,
            aiFeedback: ans.aiFeedback || '',
          });
        }
      }
    }

    await submission.save();
    log(`Submission updated by teacher: ${submission._id} for student "${studentName}"`);
    return res.json(submission);
  } catch (err) {
    logError('updateStudentSubmission failed', err);
    return res.status(500).json({ error: 'Failed to update student submission' });
  }
}
