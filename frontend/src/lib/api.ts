// src/lib/api.ts
import { Assignment, CreateAssignmentDTO, AssignmentRow } from '@/types/assignment';
import { Section, Question, QuestionType } from '@/types/question';

const BASE_URL = 'http://localhost:4000/api';

// Helper to check if server is reachable
async function isServerOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// Generate realistic mock questions based on type and subject
function generateMockQuestions(type: QuestionType, count: number, startId: number, marks: number, subject: string): Question[] {
  const list: Question[] = [];
  const subjectsMap: Record<string, { easy: string[]; moderate: string[]; challenging: string[] }> = {
    science: {
      easy: [
        'Identify the chemical effect of electric current.',
        'Define chemical electrolysis in simple terms.',
        'What is an electrolyte? Give two common examples.',
        'Which metal is commonly used for electroplating iron to prevent rust?',
        'Does distilled water conduct electricity? Why or why not?'
      ],
      moderate: [
        'Why does a compass needle show deflection when current passes through a nearby wire?',
        'Explain the process of electroplating with a neat description.',
        'How can you test if a given liquid is a good or poor conductor of electricity?',
        'Describe the process of electrolysis of water.',
        'Why is chromium used for electroplating car parts and bath taps?'
      ],
      challenging: [
        'Explain the differences in conductivity between tap water, salt solution, and vinegar.',
        'Describe the electrode reactions that occur during the electrolysis of copper sulfate solution.',
        'Describe why a battery is needed in an electroplating circuit and detail the electron flow.',
        'Evaluate the environmental hazards associated with electroplating waste disposal.',
        'Design an experiment to prove that chemical changes occur when current is passed through starch-infused potato.'
      ]
    },
    default: {
      easy: [
        'Define the basic concept of this topic.',
        'What is the primary definition of the subject matter?',
        'State the first rule of this unit.',
        'List two key components of this system.',
        'Give a basic example of this phenomenon.'
      ],
      moderate: [
        'Explain how these two variables interact with each other.',
        'Describe the main steps to solve or analyze this scenario.',
        'Compare and contrast the two major approaches to this topic.',
        'How does changing the initial parameters affect the output?',
        'Analyze the historical significance or purpose of this mechanism.'
      ],
      challenging: [
        'Critically evaluate the arguments for and against this theory.',
        'Design a comprehensive workflow representing the core process here.',
        'Solve the advanced multi-step problem related to this concept.',
        'Explain the underlying molecular or systemic factors causing this behavior.',
        'Formulate a hypothesis detailing the future developments of this field.'
      ]
    }
  };

  const pool = subjectsMap[subject.toLowerCase()] || subjectsMap.default;

  for (let i = 0; i < count; i++) {
    const diffs: ('easy' | 'moderate' | 'challenging')[] = ['easy', 'moderate', 'challenging'];
    const difficulty = diffs[i % 3];
    const poolList = pool[difficulty];
    const text = poolList[Math.floor(Math.random() * poolList.length)] + ` (Q#${startId + i})`;

    const q: Question = {
      id: `q-${startId + i}`,
      text,
      type,
      difficulty,
      marks
    };

    if (type === 'mcq') {
      q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      q.answer = 'Option B';
    } else if (type === 'truefalse') {
      q.options = ['True', 'False'];
      q.answer = 'True';
    } else {
      q.answer = `Sample solution showing how to address: "${text}". Make sure to highlight key vocabulary terms.`;
    }

    list.push(q);
  }
  return list;
}

// Map QuestionType to section titles and instructions
function getSectionInfo(type: QuestionType, index: number, marks: number) {
  const labels = ['A', 'B', 'C', 'D', 'E'];
  const label = `Section ${labels[index] || 'X'}`;
  
  switch (type) {
    case 'mcq':
      return {
        label,
        title: 'Multiple Choice Questions',
        instruction: `Choose the correct option. Each question carries ${marks} mark(s).`
      };
    case 'short':
      return {
        label,
        title: 'Short Answer Questions',
        instruction: `Answer in 30-50 words. Each question carries ${marks} mark(s).`
      };
    case 'long':
      return {
        label,
        title: 'Long Answer Questions',
        instruction: `Answer in detail (80-120 words). Each question carries ${marks} mark(s).`
      };
    case 'truefalse':
      return {
        label,
        title: 'True or False',
        instruction: `Identify if the statements are True or False. Each question carries ${marks} mark(s).`
      };
    case 'fillblank':
      return {
        label,
        title: 'Fill in the Blanks',
        instruction: `Fill in the missing words. Each question carries ${marks} mark(s).`
      };
  }
}

export async function createAssignment(data: CreateAssignmentDTO): Promise<{ assignmentId: string; jobId: string }> {
  if (await isServerOnline()) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('subject', data.subject);
    formData.append('grade', data.grade);
    formData.append('dueDate', data.dueDate);
    formData.append('questionRows', JSON.stringify(data.questionRows));
    if (data.additionalInstructions) {
      formData.append('additionalInstructions', data.additionalInstructions);
    }
    if (data.file) {
      formData.append('file', data.file);
    }

    const res = await fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    return res.json();
  } else {
    // Client-side simulation fallback
    const assignmentId = `assign-${Date.now()}`;
    const jobId = `job-${Date.now()}`;

    // Compute total marks
    const totalMarks = data.questionRows.reduce((acc, row) => acc + (row.count * row.marks), 0);

    // Create the pending assignment structure
    const newAssignment: Assignment = {
      _id: assignmentId,
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      dueDate: data.dueDate,
      questionRows: data.questionRows,
      totalMarks,
      additionalInstructions: data.additionalInstructions,
      status: 'pending',
      jobId,
      createdAt: new Date().toISOString(),
    };

    // Save in localStorage for the socket hook and store to pick up
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veda_assignments');
      const list = saved ? JSON.parse(saved) : [];
      list.push(newAssignment);
      localStorage.setItem('veda_assignments', JSON.stringify(list));
      
      // Save pending job data to simulate via websocket hook
      localStorage.setItem(`job_pending_${jobId}`, JSON.stringify({ assignmentId, data }));
    }

    return { assignmentId, jobId };
  }
}

export async function listAssignments(): Promise<Assignment[]> {
  if (await isServerOnline()) {
    const res = await fetch(`${BASE_URL}/assignments`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  } else {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veda_assignments');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }
}

export async function getAssignment(id: string): Promise<Assignment> {
  if (await isServerOnline()) {
    const res = await fetch(`${BASE_URL}/assignments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch assignment details');
    return res.json();
  } else {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veda_assignments');
      const list: Assignment[] = saved ? JSON.parse(saved) : [];
      const item = list.find((a) => a._id === id);
      if (!item) throw new Error('Assignment not found');
      return item;
    }
    throw new Error('Assignment not found');
  }
}

export async function deleteAssignment(id: string): Promise<void> {
  if (await isServerOnline()) {
    const res = await fetch(`${BASE_URL}/assignments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete assignment');
  } else {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veda_assignments');
      let list: Assignment[] = saved ? JSON.parse(saved) : [];
      list = list.filter((a) => a._id !== id);
      localStorage.setItem('veda_assignments', JSON.stringify(list));
    }
  }
}

export async function regenerateAssignment(id: string): Promise<{ jobId: string }> {
  if (await isServerOnline()) {
    const res = await fetch(`${BASE_URL}/assignments/${id}/regenerate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate assignment');
    return res.json();
  } else {
    const jobId = `job-${Date.now()}`;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veda_assignments');
      const list: Assignment[] = saved ? JSON.parse(saved) : [];
      const item = list.find((a) => a._id === id);
      if (item) {
        item.status = 'pending';
        item.jobId = jobId;
        localStorage.setItem('veda_assignments', JSON.stringify(list));

        // Save pending job data to simulate
        localStorage.setItem(`job_pending_${jobId}`, JSON.stringify({ 
          assignmentId: id, 
          data: {
            title: item.title,
            subject: item.subject,
            grade: item.grade,
            dueDate: item.dueDate,
            questionRows: item.questionRows,
            additionalInstructions: item.additionalInstructions
          }
        }));
      }
    }
    return { jobId };
  }
}

export async function exportAssignmentPDF(id: string): Promise<Blob> {
  if (await isServerOnline()) {
    const res = await fetch(`${BASE_URL}/assignments/${id}/export-pdf`);
    if (!res.ok) throw new Error('Failed to export PDF');
    return res.blob();
  } else {
    // Generate a dummy text blob representing the PDF
    const assignment = await getAssignment(id);
    const content = `
      ======================================================
              ${assignment.result?.schoolName || 'DELHI PUBLIC SCHOOL'}
      ======================================================
      Subject: ${assignment.subject}            Class: ${assignment.grade}
      Time Allowed: ${assignment.result?.timeAllowed || '45 minutes'}   Max Marks: ${assignment.totalMarks}
      
      Instructions: All questions are compulsory.
      
      ${assignment.result?.sections.map(sec => `
      ${sec.label}: ${sec.title}
      (${sec.instruction})
      
      ${sec.questions.map((q, idx) => `Q${idx+1}. [${q.difficulty}] ${q.text} [${q.marks} Marks]`).join('\n')}
      `).join('\n\n')}
      
      ======================================================
                           ANSWER KEY
      ======================================================
      ${assignment.result?.answerKey.map(ak => `Q. ID ${ak.questionId}: ${ak.answer}`).join('\n')}
    `;
    return new Blob([content], { type: 'application/pdf' });
  }
}

// Helper to trigger client-side simulation of a job
export function simulateJobCompletion(jobId: string, onUpdate: (progress: number, msg: string, status: string) => void, onDone: (assignment: Assignment) => void) {
  const pendingStr = localStorage.getItem(`job_pending_${jobId}`);
  if (!pendingStr) return;

  const { assignmentId, data } = JSON.parse(pendingStr);
  const steps = [
    { progress: 10, status: 'queued', msg: 'Queued in generation pipeline...' },
    { progress: 30, status: 'processing', msg: 'Parsing uploaded file inputs...' },
    { progress: 50, status: 'processing', msg: 'Consulting AI models for CBSE/NCERT curriculum alignment...' },
    { progress: 75, status: 'processing', msg: 'Structuring sections and formatting brackets...' },
    { progress: 90, status: 'processing', msg: 'Generating full solutions and answer key...' },
    { progress: 100, status: 'done', msg: 'Finished! Loading paper preview...' }
  ];

  let currentStep = 0;
  
  const interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      localStorage.removeItem(`job_pending_${jobId}`);

      // Update assignment in localStorage to done
      const saved = localStorage.getItem('veda_assignments');
      if (saved) {
        const list: Assignment[] = JSON.parse(saved);
        const itemIndex = list.findIndex((a) => a._id === assignmentId);
        if (itemIndex > -1) {
          const item = list[itemIndex];
          
          // Generate final result structure
          let startIdCount = 1;
          const sections: Section[] = data.questionRows.map((row: AssignmentRow, rIdx: number) => {
            const secInfo = getSectionInfo(row.type, rIdx, row.marks);
            const questions = generateMockQuestions(row.type, row.count, startIdCount, row.marks, data.subject);
            startIdCount += row.count;
            return {
              id: `sec-${rIdx}-${Date.now()}`,
              label: secInfo?.label || `Section ${rIdx}`,
              title: secInfo?.title || 'Questions',
              instruction: secInfo?.instruction || 'Answer all questions.',
              questions,
              totalMarks: row.count * row.marks
            };
          });

          const answerKey = sections.flatMap(sec => 
            sec.questions.map(q => ({
              questionId: q.id,
              answer: q.answer || 'Standard AI generated response logic.'
            }))
          );

          item.status = 'done';
          item.result = {
            aiMessage: `Certainly, Lakshya! Here is the customized Question Paper for your CBSE Grade ${data.grade} ${data.subject} classes on the NCERT chapters:`,
            schoolName: 'Delhi Public School, Sector-4, Bokaro',
            subject: data.subject,
            grade: data.grade,
            timeAllowed: '45 minutes',
            totalMarks: item.totalMarks,
            sections,
            answerKey,
            generatedAt: new Date().toISOString()
          };

          list[itemIndex] = item;
          localStorage.setItem('veda_assignments', JSON.stringify(list));
          onDone(item);
        }
      }
      return;
    }

    const step = steps[currentStep];
    onUpdate(step.progress, step.msg, step.status);
    currentStep++;
  }, 1000);
}
