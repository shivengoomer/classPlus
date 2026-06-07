import { Request, Response } from 'express';
import { generateWithAI } from '../services/ai.service';
import { buildRubricPrompt } from '../utils/promptBuilder';
import { log, logError } from '../utils/logger';

// POST /api/rubrics/generate
export async function generateRubric(req: Request, res: Response) {
  try {
    const { questionText, totalMarks, subject, grade } = req.body;

    if (!questionText || !totalMarks) {
      return res.status(400).json({ error: 'Missing questionText or totalMarks' });
    }

    const prompt = buildRubricPrompt({
      questionText,
      totalMarks: Number(totalMarks),
      subject,
      grade,
    });

    log(`Generating rubric for question: "${questionText}" (${totalMarks} marks)`);
    const aiResult = await generateWithAI(prompt);

    if (!aiResult.criteria || !Array.isArray(aiResult.criteria)) {
      return res.status(500).json({ error: 'Invalid AI response format for rubric' });
    }

    return res.json(aiResult.criteria);
  } catch (error) {
    logError('Failed to generate rubric', error);
    return res.status(500).json({ error: 'Failed to generate rubric' });
  }
}
