// src/lib/validators.ts
import { CreateAssignmentDTO } from '@/types/assignment';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateAssignmentForm(data: CreateAssignmentDTO): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || data.title.trim() === '') {
    errors.push({ field: 'title', message: 'Assignment title is required' });
  }

  if (!data.subject || data.subject.trim() === '') {
    errors.push({ field: 'subject', message: 'Subject is required' });
  }

  if (!data.grade || data.grade.trim() === '') {
    errors.push({ field: 'grade', message: 'Class/Grade is required' });
  }

  if (!data.dueDate) {
    errors.push({ field: 'dueDate', message: 'Due Date is required' });
  } else {
    const selectedDate = new Date(data.dueDate);
    const today = new Date();
    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push({ field: 'dueDate', message: 'Due Date must be today or in the future' });
    }
  }

  if (!data.questionRows || data.questionRows.length === 0) {
    errors.push({ field: 'questionRows', message: 'At least one question type is required' });
  } else {
    data.questionRows.forEach((row, index) => {
      if (row.count < 1) {
        errors.push({ 
          field: `questionRows[${index}].count`, 
          message: `Number of questions in row ${index + 1} must be at least 1` 
        });
      }
      if (row.marks < 1) {
        errors.push({ 
          field: `questionRows[${index}].marks`, 
          message: `Marks per question in row ${index + 1} must be at least 1` 
        });
      }
    });
  }

  return errors;
}
