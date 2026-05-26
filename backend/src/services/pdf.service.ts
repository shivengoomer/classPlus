// src/services/pdf.service.ts
// generates a nice-looking PDF exam paper using pdfkit matching the preview format

import PDFDocument from 'pdfkit';
import { log } from '../utils/logger';

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: string[];
}

interface Section {
  label: string;
  title: string;
  instruction: string;
  totalMarks: number;
  questions: Question[];
}

interface AnswerKeyEntry {
  questionId: string;
  answer: string;
}

interface PaperData {
  schoolName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  sections: Section[];
  answerKey?: AnswerKeyEntry[];
}

export function generatePDF(data: PaperData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      log('Generating PDF matching preview layout...');

      const doc: any = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        log(`PDF generated: ${pdfBuffer.length} bytes`);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Set default text color to dark gray #303030
      doc.fillColor('#303030');

      // ---- Header ----
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(data.schoolName || 'Delhi Public School, Sector-4, Bokaro', { align: 'center' });
      doc.moveDown(0.3);

      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`Subject: ${data.subject}    |    Class: ${data.grade}`, {
          align: 'center',
        });
      doc.moveDown(0.5);

      // Time Allowed and Max Marks row
      const headerY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Time Allowed: ${data.timeAllowed || '45 minutes'}`, 60, headerY);
      doc.text(`Maximum Marks: ${data.totalMarks}`, 60, headerY, { align: 'right', width: 475.28 });
      doc.moveDown(0.6);

      // Divider line
      doc
        .moveTo(60, doc.y)
        .lineTo(535.28, doc.y)
        .strokeColor('#DADADA')
        .lineWidth(1.25)
        .stroke();
      doc.moveDown(0.8);

      // General Instructions
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('All questions are compulsory unless stated otherwise.');
      doc.moveDown(1);

      // Student Info Block
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Name: __________________________________________________________________');
      doc.moveDown(0.6);
      doc.text('Roll Number: ___________________________________________________________');
      doc.moveDown(0.6);
      
      const currentY = doc.y;
      doc.text(`Class: ${data.grade}`, 60, currentY);
      doc.text('Section: _______________________________________', 220, currentY);
      
      // Reset X coordinate and move down
      doc.x = 60;
      doc.moveDown(1.5);

      // ---- Sections & Questions ----
      let questionNumber = 1;

      // Map question ID to global sequential question number for the Answer Key
      const questionMapping: Record<string, number> = {};

      for (const section of data.sections) {
        // Check page overflow before starting new section
        if (doc.y > 650) {
          doc.addPage();
        }

        // Section Label (e.g. Section A) centered
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(section.label, { align: 'center' });
        doc.moveDown(0.3);

        // Section Title & Instruction (left aligned)
        doc
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(section.title.toUpperCase());
        
        doc
          .fontSize(8.5)
          .font('Helvetica-Oblique')
          .fillColor('#555555')
          .text(section.instruction);
        
        doc.fillColor('#303030'); // Restore color
        doc.moveDown(0.6);

        // Questions in this section
        for (const q of section.questions) {
          questionMapping[q.id] = questionNumber;

          // Check page overflow
          if (doc.y > 680) {
            doc.addPage();
          }

          const difficultyLabel = 
            q.difficulty === 'easy' ? '[Easy]' : 
            q.difficulty === 'moderate' ? '[Moderate]' : 
            '[Challenging]';

          const marksLabel = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;

          // Format: 1. [Easy] Question text here. [1 Mark]
          const qTextPrefix = `${questionNumber}.  ${difficultyLabel}  ${q.text}`;
          
          doc
            .fontSize(9.5)
            .font('Helvetica')
            .text(qTextPrefix, { continued: true });
          
          doc
            .font('Helvetica-Bold')
            .text(`  ${marksLabel}`, { continued: false });
          
          doc.moveDown(0.4);

          // If MCQ/TF Options exist
          if (q.options && q.options.length > 0) {
            const startY = doc.y;
            const leftColX = 80;
            const rightColX = 300;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

            // Loop and place in a clean two-column grid layout
            q.options.forEach((opt, idx) => {
              const letter = letters[idx] || `${idx + 1}`;
              const optText = `${letter}.  ${opt}`;
              
              const x = idx % 2 === 0 ? leftColX : rightColX;
              const y = startY + Math.floor(idx / 2) * 16;

              if (y > 740) {
                doc.addPage();
              }

              doc
                .fontSize(9)
                .font('Helvetica')
                .text(optText, x, y);
            });

            // Restore X position and advance Y below options block
            doc.x = 60;
            const rows = Math.ceil(q.options.length / 2);
            doc.y = startY + rows * 16;
            doc.moveDown(0.5);
          } else {
            doc.moveDown(0.3);
          }

          questionNumber++;
        }

        doc.moveDown(0.8);
      }

      // ---- Answer Key ----
      if (data.answerKey && data.answerKey.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        } else {
          doc.moveDown(1.5);
        }

        // Dashed divider line
        doc
          .moveTo(60, doc.y)
          .lineTo(535.28, doc.y)
          .dash(4, { space: 2 })
          .strokeColor('#CCCCCC')
          .stroke();
        
        doc.undash();
        doc.moveDown(1);

        // Center Heading
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .strokeColor('#303030')
          .text('ANSWER KEY', { align: 'center' });
        doc.moveDown(0.8);

        // Print answers sequentially
        for (const ak of data.answerKey) {
          const qNum = questionMapping[ak.questionId] || 1;
          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .text(`${qNum}. `, { continued: true })
            .font('Helvetica')
            .text(ak.answer);
          doc.moveDown(0.4);
        }
      }

      // ---- End of Question Paper Footer ----
      if (doc.y > 700) {
        doc.addPage();
      } else {
        doc.moveDown(1.5);
      }

      doc
        .moveTo(60, doc.y)
        .lineTo(535.28, doc.y)
        .strokeColor('#EAEAEA')
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#A3A3A3')
        .text('- END OF QUESTION PAPER -', { align: 'center', characterSpacing: 1.5 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
