// src/controllers/bank.controller.ts
import { Request, Response } from 'express';
import { BankQuestion } from '../models/bankQuestion.model';
import { log, logError } from '../utils/logger';

// POST /api/bank
// body: { questionText, type, options, correctAnswer, subject, grade, chapter, difficulty, bloomLevel, tags, sourceAssessmentId }
export async function saveQuestionToBank(req: Request, res: Response) {
  try {
    const creatorId = (req as any).auth?.userId;
    if (!creatorId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const {
      questionText,
      type,
      options,
      correctAnswer,
      subject,
      grade,
      chapter,
      difficulty,
      bloomLevel,
      tags = [],
      sourceAssessmentId,
    } = req.body;

    if (!questionText || !type || !subject || !grade || !difficulty) {
      return res.status(400).json({ error: 'questionText, type, subject, grade, and difficulty are required.' });
    }

    // Capitalize difficulty matching schema
    const formattedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

    // Deduplicate by text per teacher
    const existing = await BankQuestion.findOne({
      createdBy: creatorId,
      questionText: questionText.trim(),
    });

    if (existing) {
      return res.json(existing);
    }

    const bankQ = await BankQuestion.create({
      questionText: questionText.trim(),
      type,
      options,
      correctAnswer,
      subject,
      grade,
      chapter,
      difficulty: formattedDifficulty,
      bloomLevel,
      tags,
      createdBy: creatorId,
      sourceAssessmentId: sourceAssessmentId || null,
    });

    log(`Question saved to bank: ${bankQ._id} by teacher ${creatorId}`);

    return res.status(201).json(bankQ);
  } catch (err) {
    logError('saveQuestionToBank failed', err);
    return res.status(500).json({ error: 'Failed to save question to Item Bank.' });
  }
}

// GET /api/bank
// query: { subject, grade, chapter, difficulty, tag, search }
export async function listBankQuestions(req: Request, res: Response) {
  try {
    const teacherId = (req as any).auth?.userId;
    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { subject, grade, chapter, difficulty, tag, search } = req.query;

    const query: any = { createdBy: teacherId };

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (chapter) query.chapter = chapter;
    if (difficulty) {
      query.difficulty = difficulty.toString().charAt(0).toUpperCase() + difficulty.toString().slice(1).toLowerCase();
    }
    if (tag) query.tags = tag;
    if (search) {
      query.questionText = { $regex: search.toString(), $options: 'i' };
    }

    const questions = await BankQuestion.find(query).sort({ createdAt: -1 });
    return res.json(questions);
  } catch (err) {
    logError('listBankQuestions failed', err);
    return res.status(500).json({ error: 'Failed to retrieve bank questions.' });
  }
}

// DELETE /api/bank/:id
export async function deleteQuestionFromBank(req: Request, res: Response) {
  try {
    const teacherId = (req as any).auth?.userId;
    const { id } = req.params;

    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const q = await BankQuestion.findOneAndDelete({ _id: id, createdBy: teacherId });
    if (!q) {
      return res.status(404).json({ error: 'Question not found or you do not have permission.' });
    }

    log(`Question deleted from bank: ${id} by teacher ${teacherId}`);
    return res.json({ message: 'Question deleted successfully.' });
  } catch (err) {
    logError('deleteQuestionFromBank failed', err);
    return res.status(500).json({ error: 'Failed to delete question.' });
  }
}
