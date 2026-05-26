// src/services/ai.service.ts
// calls Groq AI to generate the question paper

import Groq from 'groq-sdk';
import { env } from '../config/env';
import { extractJson } from '../utils/extractJson';
import { log, logError } from '../utils/logger';

// create groq client
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export async function generateWithAI(prompt: string): Promise<any> {
  log('Calling Groq AI for question generation...');

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a CBSE/NCERT exam paper generator. You ONLY respond with valid JSON. Never include markdown, explanations, or any text outside the JSON object.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // low temp for factual, curriculum-aligned content
      max_tokens: 8000,
    });

    const rawContent = response.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error('AI returned empty response');
    }

    log(`AI response received: ${rawContent.length} chars`);

    // AI sometimes returns invalid JSON so cleanup response
    const parsed = extractJson(rawContent);
    log('Successfully parsed AI response as JSON');

    return parsed;
  } catch (error) {
    logError('AI generation failed', error);
    throw error;
  }
}
