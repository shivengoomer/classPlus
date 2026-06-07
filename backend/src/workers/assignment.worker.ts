// src/workers/assignment.worker.ts
// worker handles heavy AI generation in background
// processes jobs from the BullMQ queue one at a time

import { Worker, Job } from 'bullmq';
import path from 'path';
import fs from 'fs';
import { getRedisOptions } from '../config/redis';
import { Assignment } from '../models/assignment.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { StudentSubmission } from '../models/studentSubmission.model';
import { Notification } from '../models/notification.model';
import { LibraryItem } from '../models/library.model';
import { User } from '../models/user.model';
import { parseFile, parseFileFromUrl } from '../services/parser.service';
import { generateWithAI } from '../services/ai.service';
import { generatePDF } from '../services/pdf.service';
import { env } from '../config/env';
import { UTApi, UTFile } from 'uploadthing/server';
import { buildPrompt, buildRegeneratePrompt } from '../utils/promptBuilder';
import { broadcastToJob } from '../websocket/socket';
import { log, logError } from '../utils/logger';

interface JobData {
  assignmentId: string;
  jobId: string;
}

async function processAssignment(job: Job<JobData>) {
  const { assignmentId, jobId } = job.data;
  log(`Worker processing job ${jobId} for assignment ${assignmentId}`);

  try {
    // step 1: update status to processing
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'processing';
    await assignment.save();

    // frontend listens to this for live loader updates
    broadcastToJob(jobId, {
      type: 'job:progress',
      progress: 10,
      status: 'queued',
      message: 'Queued in generation pipeline...',
    });

    // step 2: parse uploaded file if exists
    let fileContent = '';

    if (assignment.filePath) {
      broadcastToJob(jobId, {
        type: 'job:progress',
        progress: 25,
        status: 'processing',
        message: 'Parsing uploaded file...',
      });

      try {
        fileContent = await parseFile(assignment.filePath);
      } catch (err) {
        logError('Failed to parse uploaded file, continuing without it', err);
        // don't fail the whole job if file parsing fails
      }

      // Add the uploaded reference material to the library!
      try {
        const filename = path.basename(assignment.filePath);
        const originalName = filename.replace(/^\d+-/, '');
        const ext = originalName.split('.').pop()?.toLowerCase();
        const type = ext === 'pdf' ? 'pdf' : 'doc';
        
        let formattedSize = '0 KB';
        try {
          const stats = fs.statSync(assignment.filePath);
          const size = stats.size;
          if (size >= 1024 * 1024) {
            formattedSize = `${(size / (1024 * 1024)).toFixed(1)} MB`;
          } else {
            formattedSize = `${(size / 1024).toFixed(0)} KB`;
          }
        } catch (sizeErr) {
          logError('Failed to get file size for upload', sizeErr);
        }

        let refUrl: string | undefined;

        if (env.UPLOADTHING_TOKEN) {
          try {
            log(`Uploading reference material ${originalName} to UploadThing...`);
            const fileBuffer = fs.readFileSync(assignment.filePath);
            const file = new UTFile([fileBuffer], originalName, { type: type === 'pdf' ? 'application/pdf' : 'application/msword' } as any);
            const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });
            const uploadRes = await utapi.uploadFiles([file]);
            const resData = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;

            if (resData && resData.data && resData.data.url) {
              refUrl = resData.data.url;
              log(`Reference file uploaded successfully to UploadThing: ${refUrl}`);
            } else if (resData && (resData as any).url) {
              refUrl = (resData as any).url;
              log(`Reference file uploaded successfully to UploadThing (fallback): ${refUrl}`);
            }
          } catch (uploadErr) {
            logError('Failed to upload reference file to UploadThing, using local fallback', uploadErr);
          }
        }

        if (!refUrl) {
          refUrl = `/uploads/${filename}`;
        }

        // Save reference file as a library item (tagged as 'browse' — not shown in library UI)
        const refItem = await LibraryItem.create({
          name: originalName,
          type,
          size: formattedSize,
          category: 'Reference Materials',
          url: refUrl,
          userId: assignment.userId,
          source: 'browse',
        });
        log(`Reference material saved as library item: ${refItem._id} for user ${assignment.userId}`);

        // Update assignment's fileUrl to the uploaded/local URL
        assignment.fileUrl = refUrl;

        // Clean up local file if we uploaded it to the cloud
        if (env.UPLOADTHING_TOKEN && refUrl.startsWith('http')) {
          try {
            fs.unlinkSync(assignment.filePath);
            assignment.filePath = undefined;
            log(`Cleaned up local reference file: ${filename}`);
          } catch (cleanupErr) {
            logError('Failed to delete local reference file', cleanupErr);
          }
        }
        await assignment.save();
      } catch (libErr) {
        logError('Failed to save uploaded file to library', libErr);
      }
    } else if (assignment.fileUrl) {
      broadcastToJob(jobId, {
        type: 'job:progress',
        progress: 25,
        status: 'processing',
        message: 'Fetching and parsing reference file...',
      });

      try {
        fileContent = await parseFileFromUrl(assignment.fileUrl);
      } catch (err) {
        logError('Failed to fetch file from URL, continuing without it', err);
      }
    }

    // step 3: build the AI prompt
    broadcastToJob(jobId, {
      type: 'job:progress',
      progress: 40,
      status: 'processing',
      message: 'Building structured prompt...',
    });

    let prompt = '';
    if (assignment.parentAssignmentId) {
      const parentAssignment = await Assignment.findById(assignment.parentAssignmentId);
      if (!parentAssignment) {
        throw new Error(`Parent assignment ${assignment.parentAssignmentId} not found`);
      }

      // Parse target difficulty from instructions (e.g. "Difficulty: easier")
      let targetDifficulty: 'easier' | 'same' | 'harder' = 'same';
      if (assignment.additionalInstructions?.includes('easier')) {
        targetDifficulty = 'easier';
      } else if (assignment.additionalInstructions?.includes('harder')) {
        targetDifficulty = 'harder';
      }

      // Get original questions from parent result
      const originalQuestions = parentAssignment.result?.sections?.flatMap((s: any) => 
        (s.questions || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          difficulty: q.difficulty,
          marks: q.marks,
          conceptTag: q.conceptTag || '',
        }))
      ) || [];

      // Fetch student submissions for the parent assignment to construct performance stats
      let scoreStats: { averagePercent: number; totalStudents: number } | undefined;
      try {
        const assignedAssignments = await AssignedAssignment.find({ assignmentId: assignment.parentAssignmentId });
        if (assignedAssignments.length > 0) {
          const assignedIds = assignedAssignments.map(a => a._id);
          const submissions = await StudentSubmission.find({
            assignedAssignmentId: { $in: assignedIds },
            submittedAt: { $ne: null }
          });
          
          if (submissions.length > 0) {
            let totalPercent = 0;
            submissions.forEach(sub => {
              const subMarks = sub.totalMarks || parentAssignment.totalMarks || 1;
              totalPercent += (sub.totalScore / subMarks) * 100;
            });
            scoreStats = {
              averagePercent: Math.round(totalPercent / submissions.length),
              totalStudents: submissions.length,
            };
          }
        }
      } catch (statsErr) {
        logError('Failed to fetch class performance stats for adaptive regeneration', statsErr);
      }

      prompt = buildRegeneratePrompt({
        subject: assignment.subject,
        grade: assignment.grade,
        originalQuestions,
        targetDifficulty,
        questionRows: assignment.questionRows,
        scoreStats,
      });
    } else {
      prompt = buildPrompt({
        title: assignment.title,
        subject: assignment.subject,
        grade: assignment.grade,
        questionRows: assignment.questionRows,
        additionalInstructions: assignment.additionalInstructions,
        fileContent: fileContent || undefined,
      });
    }

    // step 4: call AI
    broadcastToJob(jobId, {
      type: 'job:progress',
      progress: 50,
      status: 'processing',
      message: 'Consulting AI model for CBSE/NCERT curriculum alignment...',
    });

    const aiResult = await generateWithAI(prompt);

    // step 5: validate and save result
    broadcastToJob(jobId, {
      type: 'job:progress',
      progress: 85,
      status: 'processing',
      message: 'Structuring sections and finalizing paper...',
    });

    // make sure the result has the expected fields
    if (!aiResult.sections || !Array.isArray(aiResult.sections)) {
      throw new Error('AI response missing sections array');
    }

    // Sanitize and normalize sections, questions, types, and difficulty to match Mongoose schema enums
    const sanitizedSections = aiResult.sections.map((section: any, sIdx: number) => {
      const sId = section.id || `sec-${sIdx}-${Date.now()}`;
      return {
        id: sId,
        label: section.label || `Section ${String.fromCharCode(65 + sIdx)}`,
        title: section.title || 'Questions',
        instruction: section.instruction || 'Answer all questions.',
        totalMarks: typeof section.totalMarks === 'number' ? section.totalMarks : 0,
        questions: (section.questions || []).map((q: any, qIdx: number) => {
          return {
            id: q.id || `q-${sId}-${qIdx}-${Date.now()}`,
            text: q.text || '',
            type: normalizeQuestionType(q.type || 'short'),
            difficulty: ['easy', 'moderate', 'challenging'].includes(q.difficulty?.toLowerCase())
              ? q.difficulty.toLowerCase()
              : 'moderate',
            marks: typeof q.marks === 'number' ? q.marks : 1,
            options: Array.isArray(q.options) ? q.options : [],
            answer: q.answer || '',
            conceptTag: q.conceptTag || '',
            rubric: Array.isArray(q.rubric) ? q.rubric : [],
          };
        }),
      };
    });

    // Fetch user profile dynamically to retrieve updated school name and branch location
    let userSchoolName = 'Delhi Public School, Bokaro';
    try {
      const userProfile = await User.findOne({ clerkId: assignment.userId });
      if (userProfile && userProfile.schoolName) {
        userSchoolName = userProfile.schoolName;
        if (userProfile.schoolBranch) {
          userSchoolName += `, ${userProfile.schoolBranch}`;
        }
      }
    } catch (profileErr) {
      logError('Failed to fetch user school settings for assignment metadata', profileErr);
    }

    // save assignment before marking done
    assignment.result = {
      aiMessage: aiResult.aiMessage || `Here is your ${assignment.subject} paper for Grade ${assignment.grade}.`,
      schoolName: userSchoolName,
      subject: aiResult.subject || assignment.subject,
      grade: aiResult.grade || assignment.grade,
      timeAllowed: aiResult.timeAllowed || '45 minutes',
      totalMarks: aiResult.totalMarks || assignment.totalMarks,
      sections: sanitizedSections,
      answerKey: aiResult.answerKey || [],
      generatedAt: aiResult.generatedAt || new Date().toISOString(),
    };

    // step 5.5: Generate PDF and upload to UploadThing if token is provided
    let pdfBuffer: Buffer | undefined;
    try {
      log('Generating PDF buffer for the final paper...');
      pdfBuffer = await generatePDF({
        schoolName: assignment.result.schoolName,
        subject: assignment.result.subject,
        grade: assignment.result.grade,
        timeAllowed: assignment.result.timeAllowed,
        totalMarks: assignment.result.totalMarks,
        sections: assignment.result.sections,
        answerKey: assignment.result.answerKey,
      });

      if (pdfBuffer && env.UPLOADTHING_TOKEN) {
        try {
          broadcastToJob(jobId, {
            type: 'job:progress',
            progress: 92,
            status: 'processing',
            message: 'Uploading generated PDF paper to UploadThing...',
          });

          const fileName = `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf`;
          const file = new UTFile([pdfBuffer], fileName, { type: 'application/pdf' } as any);

          log(`Uploading ${fileName} to UploadThing...`);
          const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });
          const uploadRes = await utapi.uploadFiles([file]);
          const resData = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;

          if (resData && resData.data && resData.data.url) {
            assignment.pdfUrl = resData.data.url;
            log(`PDF uploaded successfully: ${resData.data.url}`);
          } else if (resData && (resData as any).url) {
            assignment.pdfUrl = (resData as any).url;
            log(`PDF uploaded successfully (direct url fallback): ${(resData as any).url}`);
          } else if (resData && resData.error) {
            logError('UploadThing upload returned error structure', resData.error);
          } else {
            logError('UploadThing returned unexpected response structure', uploadRes);
          }
        } catch (uploadErr) {
          logError('Failed to upload PDF to UploadThing', uploadErr);
        }
      }
    } catch (pdfErr) {
      logError('Failed to generate PDF buffer', pdfErr);
    }

    assignment.status = 'done';
    await assignment.save();

    // step 5.55: Save generated PDF as a library item under 'Exports'
    try {
      const exportUrl = assignment.pdfUrl || `http://localhost:4000/api/assignments/${assignment._id}/export-pdf`;
      let pdfSizeStr = '1.2 MB';
      if (pdfBuffer) {
        const size = pdfBuffer.length;
        if (size >= 1024 * 1024) {
          pdfSizeStr = `${(size / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          pdfSizeStr = `${(size / 1024).toFixed(0)} KB`;
        }
      }

      const exportItem = await LibraryItem.create({
        name: `${assignment.title} (Export).pdf`,
        type: 'pdf',
        size: pdfSizeStr,
        category: 'Exports',
        url: exportUrl,
        userId: assignment.userId,
        source: 'export',
      });
      log(`Generated assignment saved to library: ${exportItem._id} for user ${assignment.userId}`);
    } catch (libErr) {
      logError('Failed to save generated assignment to library', libErr);
    }

    // step 5.6: create notification
    try {
      await Notification.create({
        title: 'Assignment Ready!',
        message: `Your assignment "${assignment.title}" for ${assignment.subject} (Grade ${assignment.grade}) has been generated successfully.`,
        type: 'success',
        link: `/result/${assignmentId}`,
        read: false,
        userId: assignment.userId,
      });
    } catch (notifErr) {
      logError('Failed to create success notification', notifErr);
    }

    log(`Job ${jobId} completed — paper generated with ${aiResult.sections.length} sections`);

    // step 6: tell the frontend we're done
    broadcastToJob(jobId, {
      type: 'job:done',
      progress: 100,
      status: 'done',
      message: 'Finished! Loading paper preview...',
      assignmentId: assignmentId,
      pdfUrl: assignment.pdfUrl,
    });
  } catch (error: any) {
    logError(`Job ${jobId} failed`, error);

    // update assignment status to failed
    try {
      const failedAssignment = await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' }, { new: true });
      if (failedAssignment) {
        await Notification.create({
          title: 'Generation Failed',
          message: `We encountered an error while generating "${failedAssignment.title}". Please try again.`,
          type: 'error',
          link: '/create',
          read: false,
          userId: failedAssignment.userId,
        });
      }
    } catch {
      // if this fails too, not much we can do
    }

    // tell the frontend it failed
    broadcastToJob(jobId, {
      type: 'job:failed',
      status: 'failed',
      error: error.message || 'Failed to generate assignment',
    });

    throw error; // re-throw so BullMQ marks the job as failed
  }
}

export function startWorker() {
  const connection = getRedisOptions();

  const worker = new Worker('assignment-generation', processAssignment, {
    connection,
    concurrency: 1, // process one job at a time
  });

  worker.on('completed', (job) => {
    log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logError(`Job ${job?.id} failed`, err);
  });

  log('Assignment worker started and listening for jobs');

  return worker;
}

function normalizeQuestionType(type: string): 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank' {
  const t = type.toLowerCase().replace(/[^a-z]/g, '');
  if (t === 'mcq' || t === 'multiplechoice' || t === 'multiplechoicequestions') return 'mcq';
  if (t === 'short' || t === 'shortanswer' || t === 'shortanswerquestions') return 'short';
  if (t === 'long' || t === 'longanswer' || t === 'longanswerquestions') return 'long';
  if (t === 'truefalse' || t === 'tf' || t === 'trueorfalse') return 'truefalse';
  if (t === 'fillblank' || t === 'fillinblank' || t === 'fillintheblank' || t === 'fillintheblanks' || t === 'blank') return 'fillblank';
  return 'short'; // default fallback
}
