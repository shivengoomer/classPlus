// src/store/assignmentStore.ts
import { create } from 'zustand';
import { Assignment } from '@/types/assignment';

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  setAssignments: (list: Assignment[]) => void;
  addAssignment: (a: Assignment) => void;
  deleteAssignment: (id: string) => void;
  setCurrentAssignment: (a: Assignment | null) => void;
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    _id: 'assign-1',
    title: 'Quiz on Electricity',
    subject: 'Science',
    grade: '8th',
    dueDate: '2026-06-21',
    questionRows: [
      { type: 'short', count: 3, marks: 2 },
      { type: 'mcq', count: 1, marks: 1 }
    ],
    totalMarks: 7,
    additionalInstructions: 'Focus on NCERT Chapter 14: Chemical Effects of Electric Current.',
    status: 'done',
    createdAt: '2026-05-20T10:00:00Z',
    result: {
      aiMessage: 'Certainly, Lakshya! Here is the customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:',
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Science',
      grade: '8th',
      timeAllowed: '45 minutes',
      totalMarks: 7,
      sections: [
        {
          id: 'sec-a',
          label: 'Section A',
          title: 'Short Answer Questions',
          instruction: 'Attempt all questions. Each question carries 2 marks.',
          totalMarks: 6,
          questions: [
            {
              id: 'q1',
              text: 'Define electroplating. Explain its purpose.',
              type: 'short',
              difficulty: 'easy',
              marks: 2
            },
            {
              id: 'q2',
              text: 'What is the role of a conductor in the process of electrolysis?',
              type: 'short',
              difficulty: 'moderate',
              marks: 2
            },
            {
              id: 'q3',
              text: 'How is sodium hydroxide prepared during the electrolysis of brine?',
              type: 'short',
              difficulty: 'challenging',
              marks: 2
            }
          ]
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Multiple Choice Questions',
          instruction: 'Choose the correct option. Each question carries 1 mark.',
          totalMarks: 1,
          questions: [
            {
              id: 'q4',
              text: 'Which of the following liquids is a good conductor of electricity?',
              type: 'mcq',
              difficulty: 'easy',
              marks: 1,
              options: [
                'Distilled water',
                'Lemon juice',
                'Honey',
                'Vegetable oil'
              ]
            }
          ]
        }
      ],
      answerKey: [
        {
          questionId: 'q1',
          answer: 'Electroplating is the process of depositing a layer of any desired metal on another material by means of electricity. Its purpose is to prevent corrosion and beautify objects.'
        },
        {
          questionId: 'q2',
          answer: 'A conductor allows electrical charge carriers to flow freely through the solution, completing the electric circuit and enabling chemical decomposition.'
        },
        {
          questionId: 'q3',
          answer: 'Sodium hydroxide is produced via the Chloralkali process, where electrolysis of brine (NaCl solution) produces NaOH alongside chlorine and hydrogen.'
        },
        {
          questionId: 'q4',
          answer: 'Lemon juice (contains citric acid which dissociates into ions that conduct electricity).'
        }
      ],
      generatedAt: '2026-05-20T10:01:30Z'
    }
  },
  {
    _id: 'assign-2',
    title: 'English Grammar Test',
    subject: 'English',
    grade: '5th',
    dueDate: '2026-06-25',
    questionRows: [
      { type: 'fillblank', count: 3, marks: 1 },
      { type: 'long', count: 1, marks: 5 }
    ],
    totalMarks: 8,
    status: 'done',
    createdAt: '2026-05-22T14:30:00Z',
    result: {
      aiMessage: 'Here is the customized Question Paper for your CBSE Grade 5 English class:',
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'English',
      grade: '5th',
      timeAllowed: '30 minutes',
      totalMarks: 8,
      sections: [
        {
          id: 'sec-a',
          label: 'Section A',
          title: 'Fill in the Blanks',
          instruction: 'Fill in the blanks with the correct preposition.',
          totalMarks: 3,
          questions: [
            {
              id: 'eng-q1',
              text: 'The cat jumped _______ the table.',
              type: 'fillblank',
              difficulty: 'easy',
              marks: 1
            },
            {
              id: 'eng-q2',
              text: 'She is looking forward _______ meeting you.',
              type: 'fillblank',
              difficulty: 'moderate',
              marks: 1
            },
            {
              id: 'eng-q3',
              text: 'He succeeded _______ passing the exam despite the difficulties.',
              type: 'fillblank',
              difficulty: 'challenging',
              marks: 1
            }
          ]
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Creative Writing',
          instruction: 'Write a short paragraph on the topic given below.',
          totalMarks: 5,
          questions: [
            {
              id: 'eng-q4',
              text: 'Write a paragraph on "My Best Friend" in about 50-80 words.',
              type: 'long',
              difficulty: 'moderate',
              marks: 5
            }
          ]
        }
      ],
      answerKey: [
        {
          questionId: 'eng-q1',
          answer: 'onto / on'
        },
        {
          questionId: 'eng-q2',
          answer: 'to'
        },
        {
          questionId: 'eng-q3',
          answer: 'in'
        },
        {
          questionId: 'eng-q4',
          answer: 'The paragraph should include the friend\'s name, their positive traits, activities they do together, and why their friendship is meaningful.'
        }
      ],
      generatedAt: '2026-05-22T14:31:00Z'
    }
  }
];

export const useAssignmentStore = create<AssignmentState>((set) => {
  // Try to load initial assignments from localStorage if in client browser
  let initialList = MOCK_ASSIGNMENTS;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('veda_assignments');
    if (saved) {
      try {
        initialList = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved assignments', e);
      }
    }
  }

  return {
    assignments: initialList,
    currentAssignment: null,
    setAssignments: (list) => {
      set({ assignments: list });
      if (typeof window !== 'undefined') {
        localStorage.setItem('veda_assignments', JSON.stringify(list));
      }
    },
    addAssignment: (a) => {
      set((state) => {
        const updated = [...state.assignments, a];
        if (typeof window !== 'undefined') {
          localStorage.setItem('veda_assignments', JSON.stringify(updated));
        }
        return { assignments: updated };
      });
    },
    deleteAssignment: (id) => {
      set((state) => {
        const updated = state.assignments.filter((item) => item._id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('veda_assignments', JSON.stringify(updated));
        }
        return { 
          assignments: updated,
          currentAssignment: state.currentAssignment?._id === id ? null : state.currentAssignment
        };
      });
    },
    setCurrentAssignment: (a) => set({ currentAssignment: a })
  };
});
