// src/controllers/assignment.controller.ts
// handles all assignment-related request logic

import { Request, Response } from 'express';
import crypto from 'crypto';
import { Assignment } from '../models/assignment.model';
import { addAssignmentJob } from '../queues/assignment.queue';
import { generatePDF } from '../services/pdf.service';
import { broadcastToJob } from '../websocket/socket';
import { log, logError } from '../utils/logger';

// POST /api/assignments — create a new assignment and queue it for generation
export async function createAssignment(req: Request, res: Response) {
  try {
    const { title, subject, grade, dueDate, questionRows, additionalInstructions, fileUrl } = req.body;

    // questionRows comes as a JSON string from the form data
    let parsedRows;
    try {
      parsedRows = typeof questionRows === 'string' ? JSON.parse(questionRows) : questionRows;
    } catch {
      return res.status(400).json({ error: 'Invalid questionRows format' });
    }

    if (!title || !subject || !grade || !dueDate || !parsedRows?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // calculate total marks from question rows
    const totalMarks = parsedRows.reduce(
      (sum: number, row: any) => sum + row.count * row.marks,
      0
    );

    // generate a unique jobId (NOT starting with 'job-' since frontend uses that for mock mode)
    const jobId = crypto.randomUUID();

    // handle file upload — multer puts it on req.file
    let filePath: string | undefined;
    if (req.file) {
      filePath = req.file.path;
      log(`File uploaded: ${req.file.originalname} -> ${filePath}`);
    }

    // save assignment before queue starts
    const assignment = await Assignment.create({
      title,
      subject,
      grade,
      dueDate,
      questionRows: parsedRows,
      totalMarks,
      additionalInstructions,
      filePath,
      fileUrl,
      status: 'pending',
      jobId,
    });

    log(`Assignment created: ${assignment._id} with jobId: ${jobId}`);

    // add to queue for background processing
    await addAssignmentJob(assignment._id.toString(), jobId);

    // immediately tell connected clients the job is queued
    broadcastToJob(jobId, {
      type: 'job:queued',
      status: 'queued',
      progress: 0,
      message: 'Job queued...',
    });

    return res.status(201).json({
      assignmentId: assignment._id,
      jobId,
    });
  } catch (error) {
    logError('Failed to create assignment', error);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
}

// GET /api/assignments — list all assignments
export async function listAssignments(req: Request, res: Response) {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    return res.json(assignments);
  } catch (error) {
    logError('Failed to list assignments', error);
    return res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

// GET /api/assignments/:id — get a single assignment
export async function getAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.json(assignment);
  } catch (error) {
    logError('Failed to get assignment', error);
    return res.status(500).json({ error: 'Failed to fetch assignment' });
  }
}

// DELETE /api/assignments/:id — delete an assignment
export async function deleteAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    log(`Assignment deleted: ${req.params.id}`);
    return res.json({ message: 'Deleted successfully' });
  } catch (error) {
    logError('Failed to delete assignment', error);
    return res.status(500).json({ error: 'Failed to delete assignment' });
  }
}

// POST /api/assignments/:id/regenerate — regenerate paper for existing assignment
export async function regenerateAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // new jobId for the regeneration
    const jobId = crypto.randomUUID();

    // reset assignment for regeneration
    assignment.status = 'pending';
    assignment.jobId = jobId;
    assignment.result = undefined;
    await assignment.save();

    log(`Regenerating assignment: ${assignment._id} with new jobId: ${jobId}`);

    // queue the new job
    await addAssignmentJob(assignment._id.toString(), jobId);

    return res.json({ jobId });
  } catch (error) {
    logError('Failed to regenerate assignment', error);
    return res.status(500).json({ error: 'Failed to regenerate assignment' });
  }
}

// GET /api/assignments/:id/export-pdf — generate and download PDF
export async function exportPDF(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (!assignment.result || assignment.status !== 'done') {
      return res.status(400).json({ error: 'Assignment is not yet generated' });
    }

    // If pre-uploaded PDF exists in UploadThing, redirect directly to it
    if (assignment.pdfUrl) {
      log(`Redirecting download request to UploadThing: ${assignment.pdfUrl}`);
      return res.redirect(assignment.pdfUrl);
    }

    const pdfBuffer = await generatePDF({
      schoolName: assignment.result.schoolName,
      subject: assignment.result.subject,
      grade: assignment.result.grade,
      timeAllowed: assignment.result.timeAllowed,
      totalMarks: assignment.result.totalMarks,
      sections: assignment.result.sections,
      answerKey: assignment.result.answerKey,
    });

    // send the PDF as a download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    logError('Failed to export PDF', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
