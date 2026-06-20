// src/services/review.service.ts
import { StudentSubmission } from '../models/studentSubmission.model';
import { StudentPractice } from '../models/studentPractice.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { Assignment } from '../models/assignment.model';
import { StudentCredential } from '../models/studentCredential.model';
import { ReviewItem } from '../models/reviewItem.model';
import { log, logError } from '../utils/logger';

/**
 * Checks student performance across all submissions and practice quizzes.
 * If accuracy for a concept falls below 65%, a ReviewItem is automatically scheduled.
 */
export async function checkAndCreateReviewItems(studentId: string) {
  try {
    const student = await StudentCredential.findById(studentId);
    if (!student) return;

    const email = student.email.toLowerCase().trim();

    // 1. Fetch submissions
    const submissions = await StudentSubmission.find({ studentId: student._id });
    const assignedIds = submissions.map(s => s.assignedAssignmentId);
    const assigned = await AssignedAssignment.find({ _id: { $in: assignedIds } });
    const assignmentIds = assigned.map(a => a.assignmentId);
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } });

    const questionMap = new Map<string, { conceptTag: string }>();
    assignments.forEach(assignment => {
      assignment.result?.sections?.forEach((section: any) => {
        section.questions?.forEach((q: any) => {
          questionMap.set(q.id, {
            conceptTag: q.conceptTag || assignment.subject || 'General'
          });
        });
      });
    });

    const topicAggregates = new Map<string, { obtained: number; total: number; wrongQuestionId?: string }>();
    const addTopic = (topic: string, isCorrect: boolean, qId?: string) => {
      if (!topic) return;
      const current = topicAggregates.get(topic) || { obtained: 0, total: 0 };
      current.total += 1;
      if (isCorrect) {
        current.obtained += 1;
      } else {
        current.obtained += 0;
        current.wrongQuestionId = qId;
      }
      topicAggregates.set(topic, current);
    };

    // Process submissions
    submissions.forEach(submission => {
      submission.answers?.forEach(ans => {
        const meta = questionMap.get(ans.questionId);
        if (meta) {
          addTopic(meta.conceptTag, ans.isCorrect, ans.questionId);
        }
      });
    });

    // 2. Fetch practices
    const practices = await StudentPractice.find({
      studentEmail: email,
      submittedAt: { $ne: null }
    });

    practices.forEach(practice => {
      practice.answers?.forEach(ans => {
        addTopic(practice.topic || 'General', ans.isCorrect, ans.questionId);
      });
    });

    // 3. Evaluate accuracies and create ReviewItems for accuracy < 65%
    for (const [topic, aggregate] of topicAggregates.entries()) {
      const accuracy = Math.round((aggregate.obtained / aggregate.total) * 100);
      if (accuracy < 65) {
        // Find or create ReviewItem
        const existing = await ReviewItem.findOne({ studentId: student._id, conceptTag: topic });
        if (!existing) {
          await ReviewItem.create({
            studentId: student._id,
            conceptTag: topic,
            sourceQuestionId: aggregate.wrongQuestionId,
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            nextReviewDate: new Date(),
          });
          log(`Created spaced repetition ReviewItem for student ${student.studentName} on weak concept "${topic}" (Accuracy: ${accuracy}%)`);
        }
      }
    }
  } catch (err) {
    logError('checkAndCreateReviewItems failed', err);
  }
}
