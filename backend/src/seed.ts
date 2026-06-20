// src/seed.ts
// seeds the database with mock assignments for demo purposes
// run with: npx ts-node-dev src/seed.ts

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import crypto from 'crypto';
import { Assignment } from './models/assignment.model';
import { LibraryItem } from './models/library.model';
import { Group } from './models/group.model';
import { AssignedAssignment } from './models/assignedAssignment.model';
import { StudentSubmission } from './models/studentSubmission.model';
import { Template } from './models/template.model';
import { User } from './models/user.model';
import { Announcement } from './models/announcement.model';
import { StudentCredential } from './models/studentCredential.model';
import { BankQuestion } from './models/bankQuestion.model';
import { env } from './config/env';

const seedData = [
  {
    title: 'Quiz on Electricity',
    subject: 'Science',
    grade: '8th',
    dueDate: '2026-06-21',
    questionRows: [
      { type: 'short', count: 3, marks: 2 },
      { type: 'mcq', count: 1, marks: 1 },
    ],
    totalMarks: 7,
    additionalInstructions: 'Focus on NCERT Chapter 14: Chemical Effects of Electric Current.',
    status: 'done',
    createdAt: new Date('2026-05-20T10:00:00Z'),
    result: {
      aiMessage:
        'Certainly, Lakshya! Here is the customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:',
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
              marks: 2,
              conceptTag: 'Electroplating',
            },
            {
              id: 'q2',
              text: 'What is the role of a conductor in the process of electrolysis?',
              type: 'short',
              difficulty: 'moderate',
              marks: 2,
              conceptTag: 'Electrolysis',
            },
            {
              id: 'q3',
              text: 'How is sodium hydroxide prepared during the electrolysis of brine?',
              type: 'short',
              difficulty: 'challenging',
              marks: 2,
              conceptTag: 'Electrolysis',
            },
          ],
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
              options: ['Distilled water', 'Lemon juice', 'Honey', 'Vegetable oil'],
              answer: 'Lemon juice',
              conceptTag: 'Conductors and Insulators',
            },
          ],
        },
      ],
      answerKey: [
        {
          questionId: 'q1',
          answer:
            'Electroplating is the process of depositing a layer of any desired metal on another material by means of electricity. Its purpose is to prevent corrosion and beautify objects.',
        },
        {
          questionId: 'q2',
          answer:
            'A conductor allows electrical charge carriers to flow freely through the solution, completing the electric circuit and enabling chemical decomposition.',
        },
        {
          questionId: 'q3',
          answer:
            'Sodium hydroxide is produced via the Chloralkali process, where electrolysis of brine (NaCl solution) produces NaOH alongside chlorine and hydrogen.',
        },
        {
          questionId: 'q4',
          answer:
            'Lemon juice (contains citric acid which dissociates into ions that conduct electricity).',
        },
      ],
      generatedAt: '2026-05-20T10:01:30Z',
    },
  },

  {
    title: 'English Grammar Test',
    subject: 'English',
    grade: '5th',
    dueDate: '2026-06-25',
    questionRows: [
      { type: 'fillblank', count: 3, marks: 1 },
      { type: 'long', count: 1, marks: 5 },
    ],
    totalMarks: 8,
    status: 'done',
    createdAt: new Date('2026-05-22T14:30:00Z'),
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
              marks: 1,
              conceptTag: 'Prepositions',
            },
            {
              id: 'eng-q2',
              text: 'She is looking forward _______ meeting you.',
              type: 'fillblank',
              difficulty: 'moderate',
              marks: 1,
              conceptTag: 'Prepositions',
            },
            {
              id: 'eng-q3',
              text: 'He succeeded _______ passing the exam despite the difficulties.',
              type: 'fillblank',
              difficulty: 'challenging',
              marks: 1,
              conceptTag: 'Prepositions',
            },
          ],
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
              marks: 5,
              conceptTag: 'Creative Writing',
            },
          ],
        },
      ],
      answerKey: [
        { questionId: 'eng-q1', answer: 'onto / on' },
        { questionId: 'eng-q2', answer: 'to' },
        { questionId: 'eng-q3', answer: 'in' },
        {
          questionId: 'eng-q4',
          answer:
            "The paragraph should include the friend's name, their positive traits, activities they do together, and why their friendship is meaningful.",
        },
      ],
      generatedAt: '2026-05-22T14:31:00Z',
    },
  },

  {
    title: 'Mathematics: Algebra Basics',
    subject: 'Mathematics',
    grade: '9th',
    dueDate: '2026-06-15',
    questionRows: [
      { type: 'short', count: 5, marks: 3 },
      { type: 'long', count: 2, marks: 5 },
    ],
    totalMarks: 25,
    additionalInstructions: 'Focus on Chapter 4: Linear Equations in Two Variables from NCERT.',
    status: 'done',
    createdAt: new Date('2026-05-18T09:00:00Z'),
    result: {
      aiMessage: 'Here is your Mathematics paper for Grade 9 focusing on Algebra and Linear Equations:',
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Mathematics',
      grade: '9th',
      timeAllowed: '1 hour 30 minutes',
      totalMarks: 25,
      sections: [
        {
          id: 'sec-a',
          label: 'Section A',
          title: 'Short Answer Questions',
          instruction: 'Answer the following questions. Each question carries 3 marks.',
          totalMarks: 15,
          questions: [
            {
              id: 'math-q1',
              text: 'Solve: 2x + 3y = 12 and x - y = 1. Find the values of x and y.',
              type: 'short',
              difficulty: 'easy',
              marks: 3,
              conceptTag: 'Linear Equations',
            },
            {
              id: 'math-q2',
              text: 'Express 3x + 2y = 8 in the form y = mx + c. What is the slope?',
              type: 'short',
              difficulty: 'easy',
              marks: 3,
              conceptTag: 'Slope-Intercept Form',
            },
            {
              id: 'math-q3',
              text: 'Find two solutions for the equation 2x + 3y = 12.',
              type: 'short',
              difficulty: 'moderate',
              marks: 3,
              conceptTag: 'Linear Equations',
            },
            {
              id: 'math-q4',
              text: 'If x = 2, y = 1 is a solution of 2ax + by = 10, find the relationship between a and b.',
              type: 'short',
              difficulty: 'moderate',
              marks: 3,
              conceptTag: 'Linear Equations',
            },
            {
              id: 'math-q5',
              text: 'Show that the point (3, 2) lies on the line 2x - y = 4.',
              type: 'short',
              difficulty: 'challenging',
              marks: 3,
              conceptTag: 'Coordinate Geometry',
            },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Long Answer Questions',
          instruction: 'Answer in detail (80-120 words). Each question carries 5 marks.',
          totalMarks: 10,
          questions: [
            {
              id: 'math-q6',
              text: 'The cost of 5 oranges and 3 apples is ₹35, and the cost of 2 oranges and 4 apples is ₹28. Form linear equations and find the cost of each fruit.',
              type: 'long',
              difficulty: 'moderate',
              marks: 5,
              conceptTag: 'Word Problems',
            },
            {
              id: 'math-q7',
              text: 'Draw the graph of the equation 2x + y = 6. Find the points where the line intersects the x-axis and y-axis.',
              type: 'long',
              difficulty: 'challenging',
              marks: 5,
              conceptTag: 'Graphing Linear Equations',
            },
          ],
        },
      ],
      answerKey: [
        { questionId: 'math-q1', answer: 'x = 3, y = 2. Using substitution: from x - y = 1, x = y + 1. Substituting: 2(y+1) + 3y = 12, 5y = 10, y = 2, x = 3.' },
        { questionId: 'math-q2', answer: 'y = (-3/2)x + 4. The slope m = -3/2.' },
        { questionId: 'math-q3', answer: '(0, 4) and (6, 0). Put x = 0: y = 4. Put y = 0: x = 6.' },
        { questionId: 'math-q4', answer: '4a + b = 10. Substituting x = 2, y = 1: 2a(2) + b(1) = 10.' },
        { questionId: 'math-q5', answer: 'LHS = 2(3) - 2 = 6 - 2 = 4 = RHS. Hence proved.' },
        { questionId: 'math-q6', answer: 'Let orange = x, apple = y. 5x + 3y = 35, 2x + 4y = 28. Solving: x = ₹4, y = ₹5.' },
        { questionId: 'math-q7', answer: 'x-intercept: Put y = 0, x = 3 → (3, 0). y-intercept: Put x = 0, y = 6 → (0, 6). Plot these points and draw a straight line.' },
      ],
      generatedAt: '2026-05-18T09:05:00Z',
    },
  },

  {
    title: 'Hindi Vyakaran Pariksha',
    subject: 'Hindi',
    grade: '7th',
    dueDate: '2026-06-10',
    questionRows: [
      { type: 'mcq', count: 5, marks: 1 },
      { type: 'short', count: 3, marks: 2 },
    ],
    totalMarks: 11,
    additionalInstructions: 'Cover विशेषण (Adjectives) and क्रिया (Verbs) topics.',
    status: 'done',
    createdAt: new Date('2026-05-15T08:00:00Z'),
    result: {
      aiMessage: 'आपकी कक्षा 7 की हिंदी व्याकरण परीक्षा तैयार है:',
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Hindi',
      grade: '7th',
      timeAllowed: '40 minutes',
      totalMarks: 11,
      sections: [
        {
          id: 'sec-a',
          label: 'Section A',
          title: 'Multiple Choice Questions',
          instruction: 'सही विकल्प चुनिए। प्रत्येक प्रश्न 1 अंक का है।',
          totalMarks: 5,
          questions: [
            { id: 'hi-q1', text: '"सुन्दर" शब्द कौन-सा विशेषण है?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'सार्वनामिक'], answer: 'गुणवाचक', conceptTag: 'विशेषण' },
            { id: 'hi-q2', text: '"वह खाना खा रहा है" — इसमें क्रिया शब्द कौन-सा है?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['वह', 'खाना', 'खा रहा है', 'है'], answer: 'खा रहा है', conceptTag: 'क्रिया' },
            { id: 'hi-q3', text: '"पाँच" किस प्रकार का विशेषण है?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'सार्वनामिक'], answer: 'संख्यावाचक', conceptTag: 'विशेषण' },
            { id: 'hi-q4', text: 'अकर्मक क्रिया का उदाहरण है:', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['वह पढ़ता है', 'वह सोता है', 'वह खाना खाता है', 'वह पत्र लिखता है'], answer: 'वह सोता है', conceptTag: 'क्रिया' },
            { id: 'hi-q5', text: '"बहुत" शब्द कौन-सा विशेषण है?', type: 'mcq', difficulty: 'challenging', marks: 1, options: ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'सार्वनामिक'], answer: 'परिमाणवाचक', conceptTag: 'विशेषण' },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Short Answer Questions',
          instruction: 'संक्षेप में उत्तर दीजिए। प्रत्येक प्रश्न 2 अंक का है।',
          totalMarks: 6,
          questions: [
            { id: 'hi-q6', text: 'विशेषण की परिभाषा दीजिए और दो उदाहरण लिखिए।', type: 'short', difficulty: 'easy', marks: 2, conceptTag: 'विशेषण' },
            { id: 'hi-q7', text: 'सकर्मक और अकर्मक क्रिया में अंतर स्पष्ट कीजिए।', type: 'short', difficulty: 'moderate', marks: 2, conceptTag: 'क्रिया' },
            { id: 'hi-q8', text: 'प्रेरणार्थक क्रिया किसे कहते हैं? उदाहरण सहित समझाइए।', type: 'short', difficulty: 'challenging', marks: 2, conceptTag: 'क्रिया' },
          ],
        },
      ],
      answerKey: [
        { questionId: 'hi-q1', answer: 'गुणवाचक विशेषण' },
        { questionId: 'hi-q2', answer: 'खा रहा है' },
        { questionId: 'hi-q3', answer: 'संख्यावाचक विशेषण' },
        { questionId: 'hi-q4', answer: 'वह सोता है (कोई कर्म नहीं है)' },
        { questionId: 'hi-q5', answer: 'परिमाणवाचक विशेषण' },
        { questionId: 'hi-q6', answer: 'जो शब्द संज्ञा या सर्वनाम की विशेषता बताए, उसे विशेषण कहते हैं। उदाहरण: सुन्दर लड़की, पाँच पुस्तकें।' },
        { questionId: 'hi-q7', answer: 'सकर्मक और अकर्मक क्रिया में अंतर स्पष्ट कीजिए। सकर्मक क्रिया को कर्म की आवश्यकता होती है (वह पुस्तक पढ़ता है)। अकर्मक क्रिया बिना कर्म के पूर्ण होती है (वह सोता है)।' },
        { questionId: 'hi-q8', answer: 'जब कर्ता स्वयं कार्य न करके किसी और से करवाता है, उसे प्रेरणार्थक क्रिया कहते हैं। जैसे: माँ ने बच्चे से खाना खिलवाया।' },
      ],
      generatedAt: '2026-05-15T08:05:00Z',
    },
  },

  {
    title: 'Social Science: Indian History',
    subject: 'Social Science',
    grade: '6th',
    dueDate: '2026-06-30',
    questionRows: [
      { type: 'mcq', count: 5, marks: 1 },
      { type: 'truefalse', count: 5, marks: 1 },
      { type: 'short', count: 3, marks: 2 },
    ],
    totalMarks: 16,
    additionalInstructions: 'Based on NCERT Chapter 4: In the Earliest Cities - about the Harappan civilization.',
    status: 'done',
    createdAt: new Date('2026-05-24T11:00:00Z'),
    result: {
      aiMessage: 'Here is a comprehensive Social Science paper on the Harappan Civilization for Grade 6:',
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Social Science',
      grade: '6th',
      timeAllowed: '50 minutes',
      totalMarks: 16,
      sections: [
        {
          id: 'sec-a',
          label: 'Section A',
          title: 'Multiple Choice Questions',
          instruction: 'Choose the correct option. Each question carries 1 mark.',
          totalMarks: 5,
          questions: [
            { id: 'ss-q1', text: 'Which was the most important city of the Harappan civilization?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['Lothal', 'Mohenjo-daro', 'Kalibangan', 'Dholavira'], answer: 'Mohenjo-daro', conceptTag: 'Harappan Cities' },
            { id: 'ss-q2', text: 'The Great Bath was found at:', type: 'mcq', difficulty: 'easy', marks: 1, options: ['Harappa', 'Mohenjo-daro', 'Lothal', 'Rakhigarhi'], answer: 'Mohenjo-daro', conceptTag: 'Harappan Architecture' },
            { id: 'ss-q3', text: 'What was the main occupation of the Harappan people?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['Hunting', 'Agriculture', 'Fishing', 'Mining'], answer: 'Agriculture', conceptTag: 'Harappan Economy' },
            { id: 'ss-q4', text: 'Lothal was an important center for:', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['Bead making', 'Pottery', 'Ship building', 'Iron smelting'], answer: 'Bead making', conceptTag: 'Harappan Crafts' },
            { id: 'ss-q5', text: 'The Harappan script has been:', type: 'mcq', difficulty: 'challenging', marks: 1, options: ['Fully deciphered', 'Partially deciphered', 'Not deciphered', 'Written in Sanskrit'], answer: 'Not deciphered', conceptTag: 'Harappan Script' },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'True or False',
          instruction: 'Write True or False. Each question carries 1 mark.',
          totalMarks: 5,
          questions: [
            { id: 'ss-q6', text: 'The Harappan civilization is also known as the Indus Valley Civilization.', type: 'truefalse', difficulty: 'easy', marks: 1, options: ['True', 'False'], answer: 'True', conceptTag: 'Harappan Civilization' },
            { id: 'ss-q7', text: 'The Harappan people used iron tools.', type: 'truefalse', difficulty: 'easy', marks: 1, options: ['True', 'False'], answer: 'False', conceptTag: 'Harappan Technology' },
            { id: 'ss-q8', text: 'The cities had a well-planned drainage system.', type: 'truefalse', difficulty: 'moderate', marks: 1, options: ['True', 'False'], answer: 'True', conceptTag: 'Harappan Architecture' },
            { id: 'ss-q9', text: 'Cotton was first produced in Mesopotamia.', type: 'truefalse', difficulty: 'moderate', marks: 1, options: ['True', 'False'], answer: 'False', conceptTag: 'Harappan Economy' },
            { id: 'ss-q10', text: 'The Harappan civilization declined around 1900 BCE.', type: 'truefalse', difficulty: 'challenging', marks: 1, options: ['True', 'False'], answer: 'True', conceptTag: 'Harappan Civilization' },
          ],
        },
        {
          id: 'sec-c',
          label: 'Section C',
          title: 'Short Answer Questions',
          instruction: 'Answer in 30-50 words. Each question carries 2 marks.',
          totalMarks: 6,
          questions: [
            { id: 'ss-q11', text: 'Describe the main features of city planning in the Harappan civilization.', type: 'short', difficulty: 'easy', marks: 2, conceptTag: 'Harappan Architecture' },
            { id: 'ss-q12', text: 'What was the Great Bath? What was its likely purpose?', type: 'short', difficulty: 'moderate', marks: 2, conceptTag: 'Harappan Architecture' },
            { id: 'ss-q13', text: 'Why is the Harappan script still a mystery? What challenges do historians face?', type: 'short', difficulty: 'challenging', marks: 2, conceptTag: 'Harappan Script' },
          ],
        },
      ],
      answerKey: [
        { questionId: 'ss-q1', answer: 'Mohenjo-daro' },
        { questionId: 'ss-q2', answer: 'Mohenjo-daro' },
        { questionId: 'ss-q3', answer: 'Agriculture' },
        { questionId: 'ss-q4', answer: 'Bead making' },
        { questionId: 'ss-q5', answer: 'Not deciphered' },
        { questionId: 'ss-q6', answer: 'True' },
        { questionId: 'ss-q7', answer: 'False — They used copper and bronze tools, not iron.' },
        { questionId: 'ss-q8', answer: 'True' },
        { questionId: 'ss-q9', answer: 'False — Cotton was first produced in the Indian subcontinent.' },
        { questionId: 'ss-q10', answer: 'True' },
        { questionId: 'ss-q11', answer: 'Cities were divided into citadel and lower town. Streets were at right angles, houses had separate bathing areas, and there was an advanced drainage system.' },
        { questionId: 'ss-q12', answer: 'The Great Bath was a large rectangular tank found at Mohenjo-daro. It was likely used for ritualistic bathing and had waterproofing with bitumen.' },
        { questionId: 'ss-q13', answer: 'Why is the Harappan script still a mystery? What challenges do historians face?' },
      ],
      generatedAt: '2026-05-24T11:10:00Z',
    },
  },

  {
    title: 'Computer Science: Python Basics',
    subject: 'Computer Science',
    grade: '9th',
    dueDate: '2026-07-05',
    questionRows: [
      { type: 'mcq', count: 4, marks: 1 },
      { type: 'short', count: 3, marks: 2 },
      { type: 'long', count: 1, marks: 5 },
    ],
    totalMarks: 15,
    status: 'done',
    createdAt: new Date('2026-05-25T16:00:00Z'),
    result: {
      aiMessage: 'Here is your Computer Science paper on Python Basics for Grade 9:',
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Computer Science',
      grade: '9th',
      timeAllowed: '45 minutes',
      totalMarks: 15,
      sections: [
        {
          id: 'sec-a',
          label: 'Section A',
          title: 'Multiple Choice Questions',
          instruction: 'Choose the correct option. Each question carries 1 mark.',
          totalMarks: 4,
          questions: [
            { id: 'cs-q1', text: 'Which of the following is a valid Python variable name?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['2name', 'my-name', 'my_name', 'class'], answer: 'my_name', conceptTag: 'Variables' },
            { id: 'cs-q2', text: 'What is the output of print(type(3.14))?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['<class \'int\'>', '<class \'float\'>', '<class \'str\'>', '<class \'double\'>'], answer: '<class \'float\'>', conceptTag: 'Data Types' },
            { id: 'cs-q3', text: 'Which operator is used for floor division in Python?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['/', '//', '%', '**'], answer: '//', conceptTag: 'Operators' },
            { id: 'cs-q4', text: 'What does len("Hello") return?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['4', '5', '6', 'Error'], answer: '5', conceptTag: 'String Functions' },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Short Answer Questions',
          instruction: 'Answer in 30-50 words. Each question carries 2 marks.',
          totalMarks: 6,
          questions: [
            { id: 'cs-q5', text: 'What is the difference between a list and a tuple in Python?', type: 'short', difficulty: 'easy', marks: 2, conceptTag: 'Data Structures' },
            { id: 'cs-q6', text: 'Write a Python program to check whether a number entered by the user is even or odd.', type: 'short', difficulty: 'moderate', marks: 2, conceptTag: 'Control Flow' },
            { id: 'cs-q7', text: 'Explain what a loop is. Give an example using a for loop.', type: 'short', difficulty: 'moderate', marks: 2, conceptTag: 'Loops' },
          ],
        },
        {
          id: 'sec-c',
          label: 'Section C',
          title: 'Long Answer Questions',
          instruction: 'Answer in detail (80-120 words). Each question carries 5 marks.',
          totalMarks: 5,
          questions: [
            { id: 'cs-q8', text: 'Write a Python program that takes a list of numbers from the user and prints the largest number, smallest number, and the average.', type: 'long', difficulty: 'challenging', marks: 5, conceptTag: 'Lists and Functions' },
          ],
        },
      ],
      answerKey: [
        { questionId: 'cs-q1', answer: 'my_name — underscores are valid, hyphens and starting with digits are not, and class is a reserved keyword.' },
        { questionId: 'cs-q2', answer: '<class \'float\'> — 3.14 is a floating point number.' },
        { questionId: 'cs-q3', answer: '// — floor division divides and rounds down to the nearest integer.' },
        { questionId: 'cs-q4', answer: '5 — len() returns the number of characters in a string.' },
        { questionId: 'cs-q5', answer: 'List is mutable (can be changed after creation), uses square brackets []. Tuple is immutable (cannot be changed), uses parentheses ().' },
        { questionId: 'cs-q6', answer: 'num = int(input("Enter a number: "))\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")' },
        { questionId: 'cs-q7', answer: 'A loop repeats a block of code multiple times. Example: for i in range(5): print(i) — prints 0, 1, 2, 3, 4.' },
        { questionId: 'cs-q8', answer: 'nums = list(map(int, input().split()))\nprint("Largest:", max(nums))\nprint("Smallest:", min(nums))\nprint("Average:", sum(nums)/len(nums))' },
      ],
      generatedAt: '2026-05-25T16:05:00Z',
    },
  },

  // a pending one to show processing state
  {
    title: 'EVS: Our Environment',
    subject: 'EVS',
    grade: '4th',
    dueDate: '2026-07-10',
    questionRows: [
      { type: 'mcq', count: 5, marks: 1 },
      { type: 'fillblank', count: 3, marks: 1 },
    ],
    totalMarks: 8,
    additionalInstructions: 'Focus on plants, animals and their habitats.',
    status: 'pending',
    createdAt: new Date('2026-05-26T12:00:00Z'),
  },
];

const librarySeedData = [
  { name: 'Science Grade 8 - Chapter 14', type: 'folder', category: 'Syllabus Chapters' },
  { name: 'English Grade 5 - Prepositions', type: 'folder', category: 'Worksheets' },
  { name: 'NCERT Textbook - Electric Effects.pdf', type: 'pdf', size: '2.4 MB', category: 'Syllabus Chapters', url: 'https://utfs.io/f/dummy-textbook-electric-effects.pdf' },
  { name: 'Delhi Public School Exam Instructions.doc', type: 'doc', size: '150 KB', category: 'Reference Materials', url: 'https://utfs.io/f/dummy-exam-instructions.doc' },
  { name: 'Electricity Chapter 14 Quiz (Final Export).pdf', type: 'pdf', size: '1.2 MB', category: 'Exports', url: 'https://utfs.io/f/dummy-electricity-quiz.pdf' },
  { name: 'English Grammar Prepositions Test.pdf', type: 'pdf', size: '890 KB', category: 'Exports', url: 'https://utfs.io/f/dummy-prepositions-test.pdf' }
];

const bankQuestionSeedData = [
  {
    questionText: 'What is the chemical formula of rust?',
    type: 'mcq',
    options: ['Fe2O3', 'FeO', 'Fe3O4', 'Fe(OH)3'],
    correctAnswer: 'Fe2O3',
    subject: 'Science',
    grade: '8th',
    chapter: 'Materials: Metals and Non-Metals',
    difficulty: 'Medium',
    bloomLevel: 'Remembering',
    tags: ['Chemistry', 'Metals', 'Rusting'],
  },
  {
    questionText: 'Explain why sodium metal is stored in kerosene.',
    type: 'short',
    correctAnswer: 'Sodium is highly reactive. It reacts vigorously with oxygen and moisture in air, catching fire. To prevent this accidental contact, it is kept in kerosene.',
    subject: 'Science',
    grade: '8th',
    chapter: 'Materials: Metals and Non-Metals',
    difficulty: 'Easy',
    bloomLevel: 'Understanding',
    tags: ['Chemistry', 'Metals', 'Reactivity'],
  },
  {
    questionText: 'Solve for x: 3x + 5 = 20.',
    type: 'mcq',
    options: ['x = 3', 'x = 5', 'x = 4', 'x = 6'],
    correctAnswer: 'x = 5',
    subject: 'Mathematics',
    grade: '9th',
    chapter: 'Linear Equations',
    difficulty: 'Easy',
    bloomLevel: 'Applying',
    tags: ['Algebra', 'Equations'],
  },
  {
    questionText: 'State and prove the Pythagoras Theorem.',
    type: 'long',
    correctAnswer: 'Pythagoras Theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides. Proof involves constructing altitude to hypotenuse and utilizing similarity of triangles.',
    subject: 'Mathematics',
    grade: '9th',
    chapter: 'Triangles',
    difficulty: 'Hard',
    bloomLevel: 'Evaluating',
    tags: ['Geometry', 'Triangles', 'Pythagoras'],
  },
  {
    questionText: 'The synonym of "Magnificent" is:',
    type: 'mcq',
    options: ['Ordinary', 'Splendid', 'Dull', 'Cheap'],
    correctAnswer: 'Splendid',
    subject: 'English',
    grade: '5th',
    chapter: 'Vocabulary',
    difficulty: 'Easy',
    bloomLevel: 'Remembering',
    tags: ['Synonyms', 'Vocabulary'],
  },
  {
    questionText: 'Fill in the blank with the correct preposition: She has been living here ___ 2020.',
    type: 'fillblank',
    correctAnswer: 'since',
    subject: 'English',
    grade: '5th',
    chapter: 'Prepositions',
    difficulty: 'Medium',
    bloomLevel: 'Applying',
    tags: ['Grammar', 'Prepositions'],
  },
  {
    questionText: 'संज्ञा के कितने भेद होते हैं? उनके नाम लिखिए।',
    type: 'short',
    correctAnswer: 'संज्ञा के मुख्य रूप से पांच भेद होते हैं: व्यक्तिवाचक, जातिवाचक, भाववाचक, समूहवाचक, और द्रव्यवाचक।',
    subject: 'Hindi',
    grade: '7th',
    chapter: 'संज्ञा',
    difficulty: 'Easy',
    bloomLevel: 'Remembering',
    tags: ['व्याकरण', 'संज्ञा'],
  },
];

const groupSeedData = [
  {
    name: 'Grade 8 Science - Sec A',
    grade: '8th',
    subject: 'Science',
    rubric: 'NCERT CBSE Rubric v2.1',
    students: ['Aarav Sharma', 'Aditi Verma', 'Amit Kumar', 'Anjali Gupta', 'Deepak Roy', 'Ishaan Sen', 'Karan Mehta', 'Neha Patel', 'Pooja Joshi', 'Rahul Singh'],
  },
  {
    name: 'Grade 5 English - Sec B',
    grade: '5th',
    subject: 'English',
    rubric: 'Primary Grammar Guide',
    students: ['Aryan Jha', 'Bhavna Das', 'Chirag Seth', 'Divya Iyer', 'Esha Rao', 'Gaurav Gill', 'Jaya Nair', 'Manish Goel', 'Nikhil Sethi', 'Ritu Malhotra'],
  },
  {
    name: 'Grade 9 Maths - Sec C',
    grade: '9th',
    subject: 'Mathematics',
    rubric: 'Algebra Evaluation Key',
    students: ['Abhishek Vyas', 'Arjun Saxena', 'Komal Pandey', 'Meera Kapoor', 'Pranav Mishra', 'Rohan Dutta', 'Sanjay Dutt', 'Sneha Reddy', 'Vikas Dubey', 'Yash Gupta'],
  },
  {
    name: 'Grade 7 Science - Sec B',
    grade: '7th',
    subject: 'Science',
    rubric: 'NCERT CBSE Rubric v1.0',
    students: ['Alok Mishra', 'Geeta Johri', 'Harish Rao', 'Jyoti Prasad', 'Kiran Bedi', 'Mukul Dev', 'Narendra Sen', 'Prachi Desai', 'Sameer Kohli', 'Tanvi Shah'],
  },
];

const templateSeedData = [
  {
    name: 'CBSE Term Paper',
    description: 'Standard CBSE term examination format with MCQs, short answers, and long answers.',
    isDefault: true,
    createdBy: null,
    blueprint: {
      sections: [
        { type: 'mcq', count: 10, marks: 1 },
        { type: 'short', count: 5, marks: 3 },
        { type: 'long', count: 3, marks: 5 },
      ],
    },
  },
  {
    name: 'MCQ Quiz',
    description: 'Quick multiple choice quiz for class revision or weekly tests.',
    isDefault: true,
    createdBy: null,
    blueprint: {
      sections: [
        { type: 'mcq', count: 20, marks: 1 },
      ],
    },
  },
  {
    name: 'Viva Sheet',
    description: 'Short and long answer questions for oral examination preparation.',
    isDefault: true,
    createdBy: null,
    blueprint: {
      sections: [
        { type: 'short', count: 5, marks: 2 },
        { type: 'long', count: 3, marks: 5 },
      ],
    },
  },
  {
    name: 'Fill-in-the-Blanks Worksheet',
    description: 'Worksheet-style assessment focusing on fill-in-the-blank questions.',
    isDefault: true,
    createdBy: null,
    blueprint: {
      sections: [
        { type: 'fillblank', count: 15, marks: 1 },
      ],
    },
  },
  {
    name: 'Mixed Assessment',
    description: 'Comprehensive assessment mixing all question types for thorough evaluation.',
    isDefault: true,
    createdBy: null,
    blueprint: {
      sections: [
        { type: 'mcq', count: 5, marks: 1 },
        { type: 'truefalse', count: 5, marks: 1 },
        { type: 'fillblank', count: 5, marks: 1 },
        { type: 'short', count: 3, marks: 3 },
        { type: 'long', count: 2, marks: 5 },
      ],
    },
  },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected');

  // Make sure tester@shiven.com exists in User
  let testerUser = await User.findOne({ email: 'tester@shiven.com' });
  if (!testerUser) {
    testerUser = await User.create({
      clerkId: 'user_tester',
      email: 'tester@shiven.com',
      firstName: 'Shiven',
      lastName: 'Tester',
    });
    console.log('👤 Created default user: tester@shiven.com');
  }

  // Fetch all existing users in the database
  const users = await User.find({});
  console.log(`Found ${users.length} users in the database.`);

  let userList = users;
  if (!userList.some(u => u.email === 'tester@shiven.com')) {
    userList.push(testerUser);
  }

  // Drop legacy unique index if it exists in mongo before populating
  try {
    await StudentCredential.collection.dropIndex('studentName_1_groupId_1');
    console.log('Dropped legacy index studentName_1_groupId_1');
  } catch (err) {
    // index might not exist, ignore
  }

  // NOTE: We no longer run deleteMany({}) on any collections to avoid overwriting past data.
  console.log('⚙️ Seeding missing records (without overwriting past data)...');

  // Loop through all users and seed their workspace data
  for (const user of userList) {
    console.log(`\n👥 Seeding data for teacher: ${user.email} (${user.clerkId})`);

    // Seed library items if they do not exist
    for (const item of librarySeedData) {
      const exists = await LibraryItem.findOne({ name: item.name, userId: user.clerkId });
      if (!exists) {
        await LibraryItem.create({
          ...item,
          userId: user.clerkId
        });
      }
    }

    // Seed bank questions if they do not exist
    for (const q of bankQuestionSeedData) {
      const exists = await BankQuestion.findOne({ questionText: q.questionText, createdBy: user.clerkId });
      if (!exists) {
        await BankQuestion.create({
          ...q,
          createdBy: user.clerkId
        });
      }
    }

    // Seed assignments if they do not exist
    const userAssignments = [];
    for (const assignment of seedData) {
      let created = await Assignment.findOne({ title: assignment.title, userId: user.clerkId });
      if (!created) {
        created = await Assignment.create({
          ...assignment,
          userId: user.clerkId
        });
      }
      userAssignments.push(created);
    }

    // Seed groups if they do not exist
    const userGroups = [];
    for (const gData of groupSeedData) {
      let created = await Group.findOne({ name: gData.name, userId: user.clerkId });
      if (!created) {
        created = await Group.create({
          ...gData,
          userId: user.clerkId
        });
      }
      userGroups.push(created);
    }

    // Connect them (AssignedAssignments, Submissions, Credentials, Announcements)
    // 1. Science quiz -> Science Group
    const electricityQuiz = userAssignments.find(a => a.title === 'Quiz on Electricity');
    const scienceGroup = userGroups.find(g => g.name === 'Grade 8 Science - Sec A');
    if (electricityQuiz && scienceGroup) {
      let assigned = await AssignedAssignment.findOne({
        assignmentId: electricityQuiz._id,
        groupId: scienceGroup._id,
      });
      if (!assigned) {
        assigned = await AssignedAssignment.create({
          assignmentId: electricityQuiz._id,
          groupId: scienceGroup._id,
          assignedDate: new Date('2026-05-21T10:00:00Z'),
          dueDate: '2026-06-21',
          hintsEnabled: true,
          durationMinutes: 45,
        });
      }

      const studentAnswers = [
        { name: 'Aarav Sharma', score: 6, answers: [
          { questionId: 'q1', answer: 'Electroplating is coating metal using electricity. Prevents corrosion.', isCorrect: true, marks: 2 },
          { questionId: 'q2', answer: 'Conductor completes the circuit for electrolysis.', isCorrect: true, marks: 2 },
          { questionId: 'q3', answer: 'NaOH is made by electrolysis of salt water.', isCorrect: true, marks: 2 },
          { questionId: 'q4', answer: 'Lemon juice', isCorrect: true, marks: 1, aiFeedback: 'Correct! Citric acid makes lemon juice a conductor.' },
        ]},
        { name: 'Aditi Verma', score: 5, answers: [
          { questionId: 'q1', answer: 'Electroplating uses electricity to coat metal.', isCorrect: true, marks: 2 },
          { questionId: 'q2', answer: 'It dissolves the chemicals.', isCorrect: false, marks: 0, aiFeedback: 'Partially correct. A conductor allows charge flow, not dissolution.' },
          { questionId: 'q3', answer: 'Chloralkali process produces NaOH from brine.', isCorrect: true, marks: 2 },
          { questionId: 'q4', answer: 'Lemon juice', isCorrect: true, marks: 1 },
        ]},
        { name: 'Amit Kumar', score: 3, answers: [
          { questionId: 'q1', answer: 'It is a type of painting.', isCorrect: false, marks: 0, aiFeedback: 'Incorrect. Electroplating uses electricity to deposit metal, not paint.' },
          { questionId: 'q2', answer: 'Conductor carries current.', isCorrect: true, marks: 2 },
          { questionId: 'q3', answer: 'By mixing chemicals.', isCorrect: false, marks: 0, aiFeedback: 'Incorrect. NaOH is produced via electrolysis, not simple mixing.' },
          { questionId: 'q4', answer: 'Lemon juice', isCorrect: true, marks: 1 },
        ]},
        { name: 'Anjali Gupta', score: 4, answers: [
          { questionId: 'q1', answer: 'Using electricity to put a metal layer on objects.', isCorrect: true, marks: 2 },
          { questionId: 'q2', answer: 'It makes heat.', isCorrect: false, marks: 0, aiFeedback: 'Incorrect. Conductors allow current flow, not heat generation in electrolysis.' },
          { questionId: 'q3', answer: 'Electrolysis of NaCl solution.', isCorrect: true, marks: 2 },
          { questionId: 'q4', answer: 'Distilled water', isCorrect: false, marks: 0, aiFeedback: 'Incorrect. Distilled water lacks ions and is a poor conductor.' },
        ]},
        { name: 'Deepak Roy', score: 7, answers: [
          { questionId: 'q1', answer: 'Electroplating deposits metal using electrical current for corrosion prevention.', isCorrect: true, marks: 2 },
          { questionId: 'q2', answer: 'Conductor lets charge carriers flow through the solution.', isCorrect: true, marks: 2 },
          { questionId: 'q3', answer: 'Chloralkali process: electrolysis of brine gives NaOH, Cl2, H2.', isCorrect: true, marks: 2 },
          { questionId: 'q4', answer: 'Lemon juice', isCorrect: true, marks: 1 },
        ]},
      ];

      for (const sa of studentAnswers) {
        // Build the email address
        // For Aarav Sharma of tester@shiven.com, set it exactly to aarav.sharma@school.com
        let email = `${sa.name.toLowerCase().replace(/ /g, '')}_${user.clerkId.substring(user.clerkId.length - 4)}@school.com`.toLowerCase();
        if (sa.name === 'Aarav Sharma' && user.email === 'tester@shiven.com') {
          email = 'aarav.sharma@school.com';
        }
        const salt = email;
        const hashedPasscode = crypto.createHash('sha256').update("1234" + salt).digest('hex');

        let cred = await StudentCredential.findOne({ email });
        if (!cred) {
          cred = await StudentCredential.create({
            studentName: sa.name,
            email,
            groupIds: [scienceGroup._id],
            hashedPasscode,
          });
        } else {
          if (!cred.groupIds.some(id => id.toString() === scienceGroup._id.toString())) {
            cred.groupIds.push(scienceGroup._id as any);
            await cred.save();
          }
        }

        const submissionExists = await StudentSubmission.findOne({
          assignedAssignmentId: assigned._id,
          studentId: cred._id,
        });
        if (!submissionExists) {
          await StudentSubmission.create({
            assignedAssignmentId: assigned._id,
            studentId: cred._id,
            studentName: sa.name,
            answers: sa.answers,
            totalScore: sa.score,
            totalMarks: 7,
            submittedAt: new Date('2026-05-22T10:00:00Z'),
          });
        }
      }
      console.log(`   - Seeded "Quiz on Electricity" to Grade 8 Science with submissions & credentials.`);
    }

    // 2. Algebra Basics -> Maths Group
    const algebraQuiz = userAssignments.find(a => a.title === 'Mathematics: Algebra Basics');
    const mathsGroup = userGroups.find(g => g.name === 'Grade 9 Maths - Sec C');
    if (algebraQuiz && mathsGroup) {
      let assigned = await AssignedAssignment.findOne({
        assignmentId: algebraQuiz._id,
        groupId: mathsGroup._id,
      });
      if (!assigned) {
        assigned = await AssignedAssignment.create({
          assignmentId: algebraQuiz._id,
          groupId: mathsGroup._id,
          assignedDate: new Date('2026-05-19T09:00:00Z'),
          dueDate: '2026-06-15',
          hintsEnabled: false,
          durationMinutes: 90,
        });
      }

      const mathStudentAnswers = [
        { name: 'Abhishek Vyas', score: 22, answers: [
          { questionId: 'math-q1', answer: 'x=3, y=2', isCorrect: true, marks: 3 },
          { questionId: 'math-q2', answer: 'y = -3/2 x + 4, slope = -3/2', isCorrect: true, marks: 3 },
          { questionId: 'math-q3', answer: '(0,4) and (6,0)', isCorrect: true, marks: 3 },
          { questionId: 'math-q4', answer: '4a + b = 10', isCorrect: true, marks: 3 },
          { questionId: 'math-q5', answer: '2(3)-2=4=RHS', isCorrect: true, marks: 3 },
          { questionId: 'math-q6', answer: 'orange=4, apple=5', isCorrect: true, marks: 5 },
          { questionId: 'math-q7', answer: 'Incomplete graph description', isCorrect: false, marks: 2, aiFeedback: 'Partially correct. Graph is right but missing intersection point labels.' },
        ]},
        { name: 'Komal Pandey', score: 18, answers: [
          { questionId: 'math-q1', answer: 'x=3, y=2', isCorrect: true, marks: 3 },
          { questionId: 'math-q2', answer: 'y = -3/2 x + 4', isCorrect: true, marks: 3 },
          { questionId: 'math-q3', answer: '(3,2) and (0,4)', isCorrect: true, marks: 3 },
          { questionId: 'math-q4', answer: 'Unable to solve', isCorrect: false, marks: 0, aiFeedback: 'Substitute x=2, y=1 to get 4a+b=10.' },
          { questionId: 'math-q5', answer: '2(3)-2=4', isCorrect: true, marks: 3 },
          { questionId: 'math-q6', answer: 'orange=4, apple=5', isCorrect: true, marks: 5 },
          { questionId: 'math-q7', answer: 'Did not attempt', isCorrect: false, marks: 1 },
        ]},
      ];

      for (const sa of mathStudentAnswers) {
        const suffix = user.clerkId.substring(user.clerkId.length - 4);
        const email = `${sa.name.toLowerCase().replace(/ /g, '')}_${suffix}@school.com`.toLowerCase();
        const salt = email;
        const hashedPasscode = crypto.createHash('sha256').update("1234" + salt).digest('hex');

        let cred = await StudentCredential.findOne({ email });
        if (!cred) {
          cred = await StudentCredential.create({
            studentName: sa.name,
            email,
            groupIds: [mathsGroup._id],
            hashedPasscode,
          });
        } else {
          if (!cred.groupIds.some(id => id.toString() === mathsGroup._id.toString())) {
            cred.groupIds.push(mathsGroup._id as any);
            await cred.save();
          }
        }

        const submissionExists = await StudentSubmission.findOne({
          assignedAssignmentId: assigned._id,
          studentId: cred._id,
        });
        if (!submissionExists) {
          await StudentSubmission.create({
            assignedAssignmentId: assigned._id,
            studentId: cred._id,
            studentName: sa.name,
            answers: sa.answers,
            totalScore: sa.score,
            totalMarks: 25,
            submittedAt: new Date('2026-05-20T11:00:00Z'),
          });
        }
      }
      console.log(`   - Seeded "Mathematics: Algebra Basics" to Grade 9 Maths with submissions & credentials.`);
    }

    // Seed announcements for each group
    const teacherName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    for (const group of userGroups) {
      const title1 = 'Welcome to our class group!';
      const exists1 = await Announcement.findOne({ groupId: group._id, title: title1 });
      if (!exists1) {
        await Announcement.create({
          groupId: group._id,
          teacherId: user.clerkId,
          teacherName,
          title: title1,
          content: `Hello students! Welcome to our ${group.name} class workspace. I will post announcements, test notifications, and study resources here. Please verify your profile details and check this feed regularly!`,
        });
      }

      const title2 = 'NCERT Guidelines & Homework policy';
      const exists2 = await Announcement.findOne({ groupId: group._id, title: title2 });
      if (!exists2) {
        await Announcement.create({
          groupId: group._id,
          teacherId: user.clerkId,
          teacherName,
          title: title2,
          content: `Hi everyone, please note that all assessments and worksheets will follow the NCERT CBSE guidelines strictly. Make sure you complete your assigned assignments before their respective deadlines. Let's have a great learning journey!`,
        });
      }
    }
  }

  // Seed default templates if they do not exist
  for (const template of templateSeedData) {
    const exists = await Template.findOne({ name: template.name });
    if (!exists) {
      await Template.create(template);
    }
  }
  console.log(`✅ Default templates seeded.`);

  await mongoose.disconnect();
  console.log('👋 Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
