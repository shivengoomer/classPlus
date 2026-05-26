// src/seed.ts
// seeds the database with mock assignments for demo purposes
// run with: npx ts-node-dev src/seed.ts

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Assignment } from './models/assignment.model';
import { LibraryItem } from './models/library.model';
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
            },
            {
              id: 'q2',
              text: 'What is the role of a conductor in the process of electrolysis?',
              type: 'short',
              difficulty: 'moderate',
              marks: 2,
            },
            {
              id: 'q3',
              text: 'How is sodium hydroxide prepared during the electrolysis of brine?',
              type: 'short',
              difficulty: 'challenging',
              marks: 2,
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
            },
            {
              id: 'eng-q2',
              text: 'She is looking forward _______ meeting you.',
              type: 'fillblank',
              difficulty: 'moderate',
              marks: 1,
            },
            {
              id: 'eng-q3',
              text: 'He succeeded _______ passing the exam despite the difficulties.',
              type: 'fillblank',
              difficulty: 'challenging',
              marks: 1,
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
            },
            {
              id: 'math-q2',
              text: 'Express 3x + 2y = 8 in the form y = mx + c. What is the slope?',
              type: 'short',
              difficulty: 'easy',
              marks: 3,
            },
            {
              id: 'math-q3',
              text: 'Find two solutions for the equation 2x + 3y = 12.',
              type: 'short',
              difficulty: 'moderate',
              marks: 3,
            },
            {
              id: 'math-q4',
              text: 'If x = 2, y = 1 is a solution of 2ax + by = 10, find the relationship between a and b.',
              type: 'short',
              difficulty: 'moderate',
              marks: 3,
            },
            {
              id: 'math-q5',
              text: 'Show that the point (3, 2) lies on the line 2x - y = 4.',
              type: 'short',
              difficulty: 'challenging',
              marks: 3,
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
            },
            {
              id: 'math-q7',
              text: 'Draw the graph of the equation 2x + y = 6. Find the points where the line intersects the x-axis and y-axis.',
              type: 'long',
              difficulty: 'challenging',
              marks: 5,
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
            { id: 'hi-q1', text: '"सुन्दर" शब्द कौन-सा विशेषण है?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'सार्वनामिक'], answer: 'गुणवाचक' },
            { id: 'hi-q2', text: '"वह खाना खा रहा है" — इसमें क्रिया शब्द कौन-सा है?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['वह', 'खाना', 'खा रहा है', 'है'], answer: 'खा रहा है' },
            { id: 'hi-q3', text: '"पाँच" किस प्रकार का विशेषण है?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'सार्वनामिक'], answer: 'संख्यावाचक' },
            { id: 'hi-q4', text: 'अकर्मक क्रिया का उदाहरण है:', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['वह पढ़ता है', 'वह सोता है', 'वह खाना खाता है', 'वह पत्र लिखता है'], answer: 'वह सोता है' },
            { id: 'hi-q5', text: '"बहुत" शब्द कौन-सा विशेषण है?', type: 'mcq', difficulty: 'challenging', marks: 1, options: ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'सार्वनामिक'], answer: 'परिमाणवाचक' },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Short Answer Questions',
          instruction: 'संक्षेप में उत्तर दीजिए। प्रत्येक प्रश्न 2 अंक का है।',
          totalMarks: 6,
          questions: [
            { id: 'hi-q6', text: 'विशेषण की परिभाषा दीजिए और दो उदाहरण लिखिए।', type: 'short', difficulty: 'easy', marks: 2 },
            { id: 'hi-q7', text: 'सकर्मक और अकर्मक क्रिया में अंतर स्पष्ट कीजिए।', type: 'short', difficulty: 'moderate', marks: 2 },
            { id: 'hi-q8', text: 'प्रेरणार्थक क्रिया किसे कहते हैं? उदाहरण सहित समझाइए।', type: 'short', difficulty: 'challenging', marks: 2 },
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
        { questionId: 'hi-q7', answer: 'सकर्मक क्रिया को कर्म की आवश्यकता होती है (वह पुस्तक पढ़ता है)। अकर्मक क्रिया बिना कर्म के पूर्ण होती है (वह सोता है)।' },
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
            { id: 'ss-q1', text: 'Which was the most important city of the Harappan civilization?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['Lothal', 'Mohenjo-daro', 'Kalibangan', 'Dholavira'], answer: 'Mohenjo-daro' },
            { id: 'ss-q2', text: 'The Great Bath was found at:', type: 'mcq', difficulty: 'easy', marks: 1, options: ['Harappa', 'Mohenjo-daro', 'Lothal', 'Rakhigarhi'], answer: 'Mohenjo-daro' },
            { id: 'ss-q3', text: 'What was the main occupation of the Harappan people?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['Hunting', 'Agriculture', 'Fishing', 'Mining'], answer: 'Agriculture' },
            { id: 'ss-q4', text: 'Lothal was an important center for:', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['Bead making', 'Pottery', 'Ship building', 'Iron smelting'], answer: 'Bead making' },
            { id: 'ss-q5', text: 'The Harappan script has been:', type: 'mcq', difficulty: 'challenging', marks: 1, options: ['Fully deciphered', 'Partially deciphered', 'Not deciphered', 'Written in Sanskrit'], answer: 'Not deciphered' },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'True or False',
          instruction: 'Write True or False. Each question carries 1 mark.',
          totalMarks: 5,
          questions: [
            { id: 'ss-q6', text: 'The Harappan civilization is also known as the Indus Valley Civilization.', type: 'truefalse', difficulty: 'easy', marks: 1, options: ['True', 'False'], answer: 'True' },
            { id: 'ss-q7', text: 'The Harappan people used iron tools.', type: 'truefalse', difficulty: 'easy', marks: 1, options: ['True', 'False'], answer: 'False' },
            { id: 'ss-q8', text: 'The cities had a well-planned drainage system.', type: 'truefalse', difficulty: 'moderate', marks: 1, options: ['True', 'False'], answer: 'True' },
            { id: 'ss-q9', text: 'Cotton was first produced in Mesopotamia.', type: 'truefalse', difficulty: 'moderate', marks: 1, options: ['True', 'False'], answer: 'False' },
            { id: 'ss-q10', text: 'The Harappan civilization declined around 1900 BCE.', type: 'truefalse', difficulty: 'challenging', marks: 1, options: ['True', 'False'], answer: 'True' },
          ],
        },
        {
          id: 'sec-c',
          label: 'Section C',
          title: 'Short Answer Questions',
          instruction: 'Answer in 30-50 words. Each question carries 2 marks.',
          totalMarks: 6,
          questions: [
            { id: 'ss-q11', text: 'Describe the main features of city planning in the Harappan civilization.', type: 'short', difficulty: 'easy', marks: 2 },
            { id: 'ss-q12', text: 'What was the Great Bath? What was its likely purpose?', type: 'short', difficulty: 'moderate', marks: 2 },
            { id: 'ss-q13', text: 'Why is the Harappan script still a mystery? What challenges do historians face?', type: 'short', difficulty: 'challenging', marks: 2 },
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
        { questionId: 'ss-q13', answer: 'The Harappan script has not been deciphered because the inscriptions are very short, there is no bilingual text to compare, and the language is unknown.' },
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
            { id: 'cs-q1', text: 'Which of the following is a valid Python variable name?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['2name', 'my-name', 'my_name', 'class'], answer: 'my_name' },
            { id: 'cs-q2', text: 'What is the output of print(type(3.14))?', type: 'mcq', difficulty: 'easy', marks: 1, options: ['<class \'int\'>', '<class \'float\'>', '<class \'str\'>', '<class \'double\'>'], answer: '<class \'float\'>' },
            { id: 'cs-q3', text: 'Which operator is used for floor division in Python?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['/', '//', '%', '**'], answer: '//' },
            { id: 'cs-q4', text: 'What does len("Hello") return?', type: 'mcq', difficulty: 'moderate', marks: 1, options: ['4', '5', '6', 'Error'], answer: '5' },
          ],
        },
        {
          id: 'sec-b',
          label: 'Section B',
          title: 'Short Answer Questions',
          instruction: 'Answer in 30-50 words. Each question carries 2 marks.',
          totalMarks: 6,
          questions: [
            { id: 'cs-q5', text: 'What is the difference between a list and a tuple in Python?', type: 'short', difficulty: 'easy', marks: 2 },
            { id: 'cs-q6', text: 'Write a Python program to check whether a number entered by the user is even or odd.', type: 'short', difficulty: 'moderate', marks: 2 },
            { id: 'cs-q7', text: 'Explain what a loop is. Give an example using a for loop.', type: 'short', difficulty: 'moderate', marks: 2 },
          ],
        },
        {
          id: 'sec-c',
          label: 'Section C',
          title: 'Long Answer Questions',
          instruction: 'Answer in detail (80-120 words). Each question carries 5 marks.',
          totalMarks: 5,
          questions: [
            { id: 'cs-q8', text: 'Write a Python program that takes a list of numbers from the user and prints the largest number, smallest number, and the average.', type: 'long', difficulty: 'challenging', marks: 5 },
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

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected');

  // clear old data
  await Assignment.deleteMany({});
  console.log('🗑️  Cleared existing assignments');

  // insert seed data
  const created = await Assignment.insertMany(seedData);
  console.log(`✅ Seeded ${created.length} assignments:`);
  created.forEach((a) => {
    console.log(`   - ${a.title} (${a.status}) — created: ${a.createdAt}`);
  });

  // clear old library items
  await LibraryItem.deleteMany({});
  console.log('🗑️  Cleared existing library items');

  // insert library seed data
  const createdLibrary = await LibraryItem.insertMany(librarySeedData);
  console.log(`✅ Seeded ${createdLibrary.length} library items:`);
  createdLibrary.forEach((li) => {
    console.log(`   - ${li.name} (${li.type}) — category: ${li.category}`);
  });

  await mongoose.disconnect();
  console.log('👋 Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
