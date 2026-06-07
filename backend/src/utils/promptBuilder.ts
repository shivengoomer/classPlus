// src/utils/promptBuilder.ts
// builds the AI prompt based on assignment config and optional file content

interface QuestionRow {
  type: string;
  count: number;
  marks: number;
}

interface PromptInput {
  title: string;
  subject: string;
  grade: string;
  questionRows: QuestionRow[];
  additionalInstructions?: string;
  fileContent?: string; // extracted text from uploaded PDF/DOCX
}

// maps question type codes to readable names
const typeLabels: Record<string, string> = {
  mcq: 'Multiple Choice Questions (4 options each)',
  short: 'Short Answer Questions (30-50 words)',
  long: 'Long Answer Questions (80-120 words)',
  truefalse: 'True or False Questions',
  fillblank: 'Fill in the Blanks Questions',
};

export function buildPrompt(input: PromptInput): string {
  // build a section breakdown for the AI
  const sectionDetails = input.questionRows
    .map((row, i) => {
      const label = String.fromCharCode(65 + i); // A, B, C, D...
      const typeName = typeLabels[row.type] || row.type;
      return `- Section ${label}: ${row.count} ${typeName}, ${row.marks} mark(s) each`;
    })
    .join('\n');

  const totalMarks = input.questionRows.reduce(
    (sum, row) => sum + row.count * row.marks,
    0
  );

  let prompt = `You are an expert CBSE/NCERT exam paper generator for Indian schools.

Generate a structured question paper with the following details:

**Title:** ${input.title}
**Subject:** ${input.subject}
**Grade/Class:** ${input.grade}
**Total Marks:** ${totalMarks}

**Section Breakdown:**
${sectionDetails}

**Important Rules:**
1. All questions MUST be aligned with CBSE/NCERT curriculum for the given grade and subject.
2. Each section should have the exact number of questions specified above.
3. Mix difficulty levels: easy, moderate, and challenging within each section.
4. For MCQs, provide exactly 4 options (a, b, c, d) with one correct answer.
5. For True/False, provide the statement and the correct answer.
6. For Fill in the Blanks, use "______" to mark the blank in the question text.
7. Generate an answer key with correct answers for ALL questions.
8. Use school name "Delhi Public School, Bokaro" as default.
9. Set a reasonable time allowed (e.g., "45 minutes" for shorter papers, "3 hours" for full papers).`;

  // if teacher uploaded a reference file, include its content
  if (input.fileContent) {
    prompt += `

**Reference Material from Uploaded File:**
Use the following content as reference for generating questions. Focus on topics and concepts mentioned here:
---
${input.fileContent.substring(0, 4000)}
---`;
  }

  // if teacher added custom instructions
  if (input.additionalInstructions) {
    prompt += `

**Additional Instructions from Teacher:**
${input.additionalInstructions}`;
  }

  prompt += `

**CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no explanation, no extra text.**

The JSON must follow this exact structure:
{
  "aiMessage": "A friendly 1-2 sentence message to the teacher about the generated paper",
  "schoolName": "Delhi Public School, Bokaro",
  "subject": "${input.subject}",
  "grade": "${input.grade}",
  "timeAllowed": "45 minutes",
  "totalMarks": ${totalMarks},
  "sections": [
    {
      "id": "sec-1",
      "label": "Section A",
      "title": "Multiple Choice Questions",
      "instruction": "Choose the correct option. Each question carries 1 mark(s).",
      "totalMarks": 5,
      "questions": [
        {
          "id": "q-1",
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["option a", "option b", "option c", "option d"],
          "answer": "option b"
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionId": "q-1",
      "answer": "The correct answer text"
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}

Remember: ONLY output the JSON. Nothing else.`;

  return prompt;
}

// Feature 1: Adaptive Difficulty Re-generation
interface RegenerateInput {
  subject: string;
  grade: string;
  originalQuestions: { id: string; text: string; type: string; difficulty: string; marks: number; conceptTag?: string }[];
  targetDifficulty: 'easier' | 'same' | 'harder';
  questionRows: QuestionRow[];
  scoreStats?: { averagePercent: number; totalStudents: number };
}

export function buildRegeneratePrompt(input: RegenerateInput): string {
  const difficultyGuidance = input.targetDifficulty === 'easier'
    ? 'Make questions significantly EASIER. Use simpler vocabulary, more direct questions, and avoid multi-step reasoning. Shift difficulty distribution toward: 60% easy, 30% moderate, 10% challenging.'
    : input.targetDifficulty === 'harder'
    ? 'Make questions significantly HARDER. Use deeper analytical thinking, multi-step reasoning, and application-based questions. Shift difficulty distribution toward: 10% easy, 30% moderate, 60% challenging.'
    : 'Keep the same difficulty level but generate completely NEW questions on the same topics.';

  const totalMarks = input.questionRows.reduce(
    (sum, row) => sum + row.count * row.marks,
    0
  );

  const sectionDetails = input.questionRows
    .map((row, i) => {
      const label = String.fromCharCode(65 + i);
      const typeName = typeLabels[row.type] || row.type;
      return `- Section ${label}: ${row.count} ${typeName}, ${row.marks} mark(s) each`;
    })
    .join('\n');

  const originalQSummary = input.originalQuestions
    .map(q => `  - [${q.difficulty}] ${q.text} (${q.marks} marks, concept: ${q.conceptTag || 'N/A'})`)
    .join('\n');

  let prompt = `You are an expert CBSE/NCERT exam paper generator. You are REGENERATING a question paper at a DIFFERENT difficulty level.

**Subject:** ${input.subject}
**Grade/Class:** ${input.grade}
**Target Difficulty:** ${input.targetDifficulty.toUpperCase()}
**Total Marks:** ${totalMarks}

**Section Breakdown:**
${sectionDetails}

**Difficulty Guidance:**
${difficultyGuidance}`;

  if (input.scoreStats) {
    prompt += `

**Class Performance on Original Paper:**
- Average Score: ${input.scoreStats.averagePercent}% across ${input.scoreStats.totalStudents} students
- ${input.scoreStats.averagePercent > 70 ? 'Students performed well — consider increasing difficulty.' : input.scoreStats.averagePercent < 40 ? 'Students struggled — consider simplifying significantly.' : 'Mixed performance — adjust difficulty as requested.'}`;
  }

  prompt += `

**Original Questions (for reference — generate NEW questions on the same topics):**
${originalQSummary}

**Important Rules:**
1. Generate completely NEW questions — do NOT copy the originals.
2. Cover the SAME topics/concepts as the original paper.
3. Each question MUST include a "conceptTag" field with the topic label.
4. For MCQs, provide exactly 4 options.
5. Generate a complete answer key.

**CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no explanation.**

The JSON must follow this exact structure:
{
  "aiMessage": "A friendly message about the regenerated paper and difficulty changes",
  "schoolName": "Delhi Public School, Bokaro",
  "subject": "${input.subject}",
  "grade": "${input.grade}",
  "timeAllowed": "45 minutes",
  "totalMarks": ${totalMarks},
  "sections": [
    {
      "id": "sec-1",
      "label": "Section A",
      "title": "Section Title",
      "instruction": "Section instruction",
      "totalMarks": 10,
      "questions": [
        {
          "id": "q-1",
          "text": "Question text",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["a", "b", "c", "d"],
          "answer": "b",
          "conceptTag": "Topic Name"
        }
      ]
    }
  ],
  "answerKey": [
    { "questionId": "q-1", "answer": "Correct answer" }
  ],
  "generatedAt": "${new Date().toISOString()}"
}

Remember: ONLY output the JSON. Nothing else.`;

  return prompt;
}

// Feature 3: Rubric Auto-Builder
interface RubricInput {
  questionText: string;
  totalMarks: number;
  subject?: string;
  grade?: string;
}

export function buildRubricPrompt(input: RubricInput): string {
  return `You are an expert CBSE educator creating a marking rubric for a question.

**Question:** ${input.questionText}
**Total Marks:** ${input.totalMarks}
${input.subject ? `**Subject:** ${input.subject}` : ''}
${input.grade ? `**Grade:** ${input.grade}` : ''}

Generate a detailed rubric that breaks down the marking criteria. Each criterion should award specific marks and describe what the student must demonstrate to earn those marks.

**CRITICAL: Respond with ONLY a valid JSON object. No markdown, no explanation.**

{
  "criteria": [
    {
      "label": "Criterion name (e.g. 'Definition', 'Example', 'Explanation')",
      "marks": 1,
      "description": "What the student must write/demonstrate to earn these marks"
    }
  ]
}

Rules:
1. The sum of all criteria marks MUST equal ${input.totalMarks}.
2. Provide 2-5 criteria depending on total marks.
3. Use clear, teacher-friendly language.
4. Be specific about what earns marks.

Remember: ONLY output the JSON. Nothing else.`;
}

// Feature 2: AI Misconception Detector
interface MisconceptionInput {
  questionText: string;
  correctAnswer: string;
  wrongAnswers: { answer: string; count: number }[];
  subject: string;
  grade: string;
}

export function buildMisconceptionPrompt(input: MisconceptionInput): string {
  const wrongAnswerList = input.wrongAnswers
    .map(wa => `  - "${wa.answer}" (${wa.count} student${wa.count > 1 ? 's' : ''})`)
    .join('\n');

  return `You are an expert educational psychologist analyzing student misconceptions.

**Subject:** ${input.subject}
**Grade:** ${input.grade}
**Question:** ${input.questionText}
**Correct Answer:** ${input.correctAnswer}

**Wrong Answers Given by Students:**
${wrongAnswerList}

Analyze the wrong answers and identify the underlying misconceptions. Group similar wrong answers if they indicate the same misconception.

**CRITICAL: Respond with ONLY a valid JSON object. No markdown, no explanation.**

{
  "misconceptions": [
    {
      "label": "Short misconception name (e.g. 'Confusing electrolysis with electroplating')",
      "affectedCount": 3,
      "explanation": "Detailed explanation of why students made this error and how to address it in teaching"
    }
  ]
}

Rules:
1. Identify 1-4 distinct misconceptions.
2. The affectedCount should reflect how many students show this misconception.
3. Give actionable teaching suggestions in the explanation.

Remember: ONLY output the JSON. Nothing else.`;
}

// Feature 4: Hint-on-Demand (Socratic hints)
interface HintInput {
  questionText: string;
  questionType: string;
  subject: string;
  grade: string;
  options?: string[];
}

export function buildHintPrompt(input: HintInput): string {
  let optionsContext = '';
  if (input.options && input.options.length > 0) {
    optionsContext = `\n**Options:** ${input.options.join(', ')}`;
  }

  return `You are a patient, encouraging tutor helping a Grade ${input.grade} student with ${input.subject}.

**Question:** ${input.questionText}
**Question Type:** ${input.questionType}${optionsContext}

Give the student a Socratic hint that guides them toward the answer WITHOUT giving it away. The hint should:
1. Point them to a relevant concept or formula they should recall
2. Ask a guiding sub-question that leads to the answer
3. Be age-appropriate and encouraging

**CRITICAL: Respond with ONLY a valid JSON object. No markdown, no explanation.**

{
  "hint": "Your Socratic hint text here — 1-3 sentences maximum"
}

Rules:
1. Do NOT reveal the answer.
2. Do NOT say "the answer is..." or similar.
3. Be warm and encouraging.
4. Keep it concise (1-3 sentences).

Remember: ONLY output the JSON. Nothing else.`;
}
