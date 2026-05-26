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
