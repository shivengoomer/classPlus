// type declarations for packages without built-in types

declare module 'pdfkit' {
  import { Writable } from 'stream';

  interface PDFDocumentOptions {
    size?: string | [number, number];
    margins?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    layout?: 'portrait' | 'landscape';
  }

  interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify';
    width?: number;
    continued?: boolean;
    underline?: boolean;
  }

  class PDFDocument extends Writable {
    constructor(options?: PDFDocumentOptions);
    fontSize(size: number): this;
    font(name: string): this;
    text(text: string, options?: TextOptions): this;
    text(text: string, x?: number, y?: number, options?: TextOptions): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    addPage(options?: PDFDocumentOptions): this;
    end(): void;
    on(event: string, listener: (...args: any[]) => void): this;
    y: number;
    x: number;
    page: { width: number; height: number };
  }

  export = PDFDocument;
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  export = pdfParse;
}
