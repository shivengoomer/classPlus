import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Group } from '../models/group.model';
import { StudentCredential } from '../models/studentCredential.model';
import { StudentSubmission } from '../models/studentSubmission.model';
import { StudentPractice } from '../models/studentPractice.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { Assignment } from '../models/assignment.model';
import { logError } from '../utils/logger';

type ReportGroup = {
  id: string;
  name: string;
  grade: string;
  subject: string;
};

type TopicSource = 'assignment' | 'practice' | 'both';

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function asObjectIdString(value: unknown) {
  return value instanceof mongoose.Types.ObjectId ? value.toString() : String(value);
}

function pct(score?: number | null, total?: number | null) {
  if (!total || total <= 0) return null;
  return Math.round(((score || 0) / total) * 100);
}

// GET /api/reports/students
// Lists registered students in the teacher's classes with aggregate statistics.
export async function listStudentReports(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const groups = await Group.find({ userId }).lean();
    const groupIds = groups.map((group) => group._id);
    if (groupIds.length === 0) {
      return res.json([]);
    }

    const groupById = new Map<string, ReportGroup>();
    groups.forEach((group) => {
      groupById.set(asObjectIdString(group._id), {
        id: asObjectIdString(group._id),
        name: group.name,
        grade: group.grade,
        subject: group.subject,
      });
    });

    const credentials = await StudentCredential.find({ groupIds: { $in: groupIds } }).lean();
    if (credentials.length === 0) {
      return res.json([]);
    }

    const emails = credentials.map((cred) => normalizeText(cred.email));
    const assigned = await AssignedAssignment.find({ groupId: { $in: groupIds } }).lean();
    const assignedIds = assigned.map((item) => item._id);
    const submissions = await StudentSubmission.find({ assignedAssignmentId: { $in: assignedIds } }).lean();
    const practices = await StudentPractice.find({ studentEmail: { $in: emails } }).lean();

    const assignedByGroupId = new Map<string, typeof assigned>();
    assigned.forEach((item) => {
      const key = asObjectIdString(item.groupId);
      const current = assignedByGroupId.get(key) || [];
      current.push(item);
      assignedByGroupId.set(key, current);
    });

    const reports = credentials.map((cred) => {
      const studentName = cred.studentName.trim();
      const email = normalizeText(cred.email);
      const credentialGroupIds = cred.groupIds.map((id) => asObjectIdString(id));
      const enrolledGroups = credentialGroupIds
        .map((id) => groupById.get(id))
        .filter(Boolean) as ReportGroup[];

      const studentAssigned = credentialGroupIds.flatMap((id) => assignedByGroupId.get(id) || []);
      const studentAssignedIds = new Set(studentAssigned.map((item) => asObjectIdString(item._id)));
      const studentSubmissions = submissions.filter((submission) => {
        return (
          studentAssignedIds.has(asObjectIdString(submission.assignedAssignmentId)) &&
          normalizeText(submission.studentName) === normalizeText(studentName)
        );
      });

      const completedSubmissions = studentSubmissions.filter((submission) => Boolean(submission.submittedAt));
      const assignmentTotals = completedSubmissions.reduce(
        (acc, submission) => {
          acc.score += submission.totalScore || 0;
          acc.total += submission.totalMarks || 0;
          return acc;
        },
        { score: 0, total: 0 }
      );

      const studentPractices = practices.filter((practice) => normalizeText(practice.studentEmail) === email);
      const submittedPractices = studentPractices.filter((practice) => Boolean(practice.submittedAt));
      const practiceTotals = submittedPractices.reduce(
        (acc, practice) => {
          acc.score += practice.score || 0;
          acc.total += practice.totalMarks || 0;
          return acc;
        },
        { score: 0, total: 0 }
      );

      return {
        studentName,
        email,
        isRegistered: true,
        groups: enrolledGroups,
        assignmentsAssigned: studentAssigned.length,
        assignmentsCompleted: completedSubmissions.length,
        assignmentAverageScore: pct(assignmentTotals.score, assignmentTotals.total),
        practicesCount: submittedPractices.length,
        practicesAverageScore: pct(practiceTotals.score, practiceTotals.total),
      };
    });

    reports.sort((a, b) => a.studentName.localeCompare(b.studentName));
    return res.json(reports);
  } catch (err) {
    logError('listStudentReports failed', err);
    return res.status(500).json({ error: 'Failed to fetch student reports.' });
  }
}

// GET /api/reports/student/:email
// Fetches detailed metrics for a single registered student by email.
export async function getDetailedStudentReport(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rawEmailParam = Array.isArray(req.params.email) ? req.params.email[0] : req.params.email;
    const email = normalizeText(rawEmailParam || '');
    if (!email) {
      return res.status(400).json({ error: 'Student email is required' });
    }

    const teacherGroups = await Group.find({ userId }).lean();
    const teacherGroupIds = teacherGroups.map((group) => group._id);
    if (teacherGroupIds.length === 0) {
      return res.status(404).json({ error: 'Student not found in your classes' });
    }

    const credential = await StudentCredential.findOne({
      email: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') },
      groupIds: { $in: teacherGroupIds },
    }).lean();

    if (!credential) {
      return res.status(404).json({ error: 'Student not found in your classes' });
    }

    const studentGroupIdSet = new Set(credential.groupIds.map((id) => asObjectIdString(id)));
    const studentGroups = teacherGroups.filter((group) => studentGroupIdSet.has(asObjectIdString(group._id)));
    const studentGroupIds = studentGroups.map((group) => group._id);

    const assigned = await AssignedAssignment.find({ groupId: { $in: studentGroupIds } }).lean();
    const assignedIds = assigned.map((item) => item._id);
    const submissions = await StudentSubmission.find({
      studentName: { $regex: new RegExp(`^${escapeRegExp(credential.studentName.trim())}$`, 'i') },
      assignedAssignmentId: { $in: assignedIds },
    }).lean();

    const assignmentIds = assigned.map((item) => item.assignmentId);
    const assignments = await Assignment.find({ _id: { $in: assignmentIds }, userId }).lean();

    const assignmentById = new Map(assignments.map((assignment) => [asObjectIdString(assignment._id), assignment]));
    const assignedById = new Map(assigned.map((item) => [asObjectIdString(item._id), item]));

    const questionMetadata = new Map<string, { conceptTag: string; marks: number; text: string }>();
    assignments.forEach((assignment) => {
      assignment.result?.sections?.forEach((section: any) => {
        section.questions?.forEach((question: any) => {
          questionMetadata.set(question.id, {
            conceptTag: question.conceptTag || assignment.subject || 'General',
            marks: question.marks || 0,
            text: question.text || '',
          });
        });
      });
    });

    const topicAggregates = new Map<string, { obtained: number; total: number; source: TopicSource }>();
    const addTopic = (topic: string, obtained: number, total: number, source: Exclude<TopicSource, 'both'>) => {
      if (!topic || total <= 0) return;
      const current = topicAggregates.get(topic);
      if (!current) {
        topicAggregates.set(topic, { obtained, total, source });
        return;
      }

      current.obtained += obtained;
      current.total += total;
      current.source = current.source === source ? source : 'both';
      topicAggregates.set(topic, current);
    };

    submissions.forEach((submission) => {
      submission.answers?.forEach((answer) => {
        const meta = questionMetadata.get(answer.questionId);
        if (!meta) return;
        addTopic(meta.conceptTag, answer.marks || 0, meta.marks || 0, 'assignment');
      });
    });

    const practices = await StudentPractice.find({
      studentEmail: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') },
      submittedAt: { $exists: true, $ne: null },
    }).lean();

    practices.forEach((practice) => {
      addTopic(practice.topic || 'General', practice.score || 0, practice.totalMarks || 0, 'practice');
    });

    const topics = Array.from(topicAggregates.entries())
      .map(([topic, aggregate]) => ({
        topic,
        accuracy: pct(aggregate.obtained, aggregate.total) || 0,
        totalMarks: aggregate.total,
        source: aggregate.source,
      }))
      .sort((a, b) => a.topic.localeCompare(b.topic));

    const weakTopics = topics.filter((topic) => topic.accuracy < 65).sort((a, b) => a.accuracy - b.accuracy);
    const strongTopics = topics.filter((topic) => topic.accuracy >= 65).sort((a, b) => b.accuracy - a.accuracy);

    const timeline = [
      ...submissions
        .filter((submission) => Boolean(submission.submittedAt))
        .map((submission) => {
          const assignedItem = assignedById.get(asObjectIdString(submission.assignedAssignmentId));
          const assignment = assignedItem ? assignmentById.get(asObjectIdString(assignedItem.assignmentId)) : null;
          return {
            type: 'assignment' as const,
            title: assignment?.title || 'Assignment',
            score: submission.totalScore || 0,
            totalMarks: submission.totalMarks || 0,
            percentage: pct(submission.totalScore, submission.totalMarks) || 0,
            date: submission.submittedAt,
          };
        }),
      ...practices.map((practice) => ({
        type: 'practice' as const,
        title: `AI Practice: ${practice.topic}`,
        score: practice.score || 0,
        totalMarks: practice.totalMarks || 0,
        percentage: pct(practice.score, practice.totalMarks) || 0,
        date: practice.submittedAt || practice.updatedAt,
      })),
    ].sort((a, b) => new Date(a.date as Date).getTime() - new Date(b.date as Date).getTime());

    const struggleNotes = [
      ...submissions.flatMap((submission) => {
        return (submission.answers || [])
          .filter((answer) => !answer.isCorrect && Boolean(answer.aiFeedback))
          .map((answer) => {
            const meta = questionMetadata.get(answer.questionId);
            return {
              type: 'assignment' as const,
              topic: meta?.conceptTag || 'General',
              scoreText: `Marks: ${answer.marks || 0}/${meta?.marks || 0}`,
              questionText: meta?.text,
              feedback: answer.aiFeedback || '',
              date: submission.submittedAt || submission.updatedAt,
            };
          });
      }),
      ...practices
        .filter((practice) => (pct(practice.score, practice.totalMarks) || 0) < 65 && Boolean(practice.feedback))
        .map((practice) => ({
          type: 'practice' as const,
          topic: practice.topic || 'General',
          scoreText: `Score: ${practice.score || 0}/${practice.totalMarks || 0} (${pct(practice.score, practice.totalMarks) || 0}%)`,
          feedback: practice.feedback || '',
          date: practice.submittedAt || practice.updatedAt,
        })),
    ].sort((a, b) => new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime());

    const logs = {
      assignments: submissions
        .map((submission) => {
          const assignedItem = assignedById.get(asObjectIdString(submission.assignedAssignmentId));
          const assignment = assignedItem ? assignmentById.get(asObjectIdString(assignedItem.assignmentId)) : null;
          return {
            title: assignment?.title || 'Assignment',
            subject: assignment?.subject || '',
            dueDate: assignedItem?.dueDate || '',
            score: submission.totalScore || 0,
            totalMarks: submission.totalMarks || 0,
            percentage: pct(submission.totalScore, submission.totalMarks),
            submittedAt: submission.submittedAt,
            autoSubmitted: submission.autoSubmitted,
          };
        })
        .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()),
      practices: practices
        .map((practice) => ({
          topic: practice.topic,
          subject: practice.subject,
          score: practice.score || 0,
          totalMarks: practice.totalMarks || 0,
          percentage: pct(practice.score, practice.totalMarks),
          submittedAt: practice.submittedAt || practice.updatedAt,
        }))
        .sort((a, b) => new Date(b.submittedAt as Date).getTime() - new Date(a.submittedAt as Date).getTime()),
    };

    return res.json({
      studentName: credential.studentName,
      email: credential.email,
      isRegistered: true,
      groups: studentGroups.map((group) => ({
        id: asObjectIdString(group._id),
        name: group.name,
        grade: group.grade,
        subject: group.subject,
      })),
      weakTopics,
      strongTopics,
      timeline,
      struggleNotes,
      logs,
    });
  } catch (err) {
    logError('getDetailedStudentReport failed', err);
    return res.status(500).json({ error: 'Failed to fetch detailed student report.' });
  }
}
