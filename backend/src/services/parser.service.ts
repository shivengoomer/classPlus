// src/services/parser.service.ts
// parses uploaded PDF or DOCX files to extract text content

import fs from 'fs';
import path from 'path';
import { log, logError } from '../utils/logger';

export async function parseFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  try {
    if (ext === '.pdf') {
      return await parsePDF(buffer);
    } else if (ext === '.docx' || ext === '.doc') {
      return await parseDOCX(buffer);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  } finally {
    // clean up the uploaded file after parsing
    try {
      fs.unlinkSync(filePath);
      log(`Cleaned up uploaded file: ${filePath}`);
    } catch {
      // file might already be deleted, that's fine
    }
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  // pdf-parse has a quirky import, this handles it
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  log(`Parsed PDF: ${data.numpages} pages, ${data.text.length} chars`);
  return data.text;
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  log(`Parsed DOCX: ${result.value.length} chars`);
  return result.value;
}

// fetch and parse a file from a URL (for UploadThing style uploads)
export async function parseFileFromUrl(fileUrl: string): Promise<string> {
  log(`Fetching file from URL: ${fileUrl}`);
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const buffer = Buffer.from(await response.arrayBuffer());

  if (contentType.includes('pdf') || fileUrl.endsWith('.pdf')) {
    return parsePDF(buffer);
  } else if (contentType.includes('word') || fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc')) {
    return parseDOCX(buffer);
  } else {
    throw new Error(`Unsupported file type from URL: ${contentType}`);
  }
}
