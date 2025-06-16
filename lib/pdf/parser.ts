/**
 * This file contains utilities for parsing different document formats.
 * In a real implementation, you would integrate with libraries like pdf.js, mammoth, etc.
 */

import { Document, Paragraph } from 'docx';
import * as mammoth from 'mammoth';

// Mock PDF.js for server-side rendering
let pdfjsLib: any = null;

// Only import PDF.js in browser environment
if (typeof window !== 'undefined') {
  try {
    pdfjsLib = require('pdfjs-dist');
    // Initialize PDF.js worker only in browser
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (error) {
    console.warn('PDF.js not available in this environment');
  }
}

/**
 * Parse a PDF file and extract its text content
 * @param buffer - The PDF file buffer
 * @returns Extracted text content
 */
export async function parsePDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // Check if we're in a Node.js environment or PDF.js is not available
    if (!pdfjsLib || typeof window === 'undefined') {
      console.warn('PDF parsing not available in server environment');
      return 'PDF content extraction not available in server environment. Please upload a DOCX file instead.';
    }

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return 'Error parsing PDF file. Please try uploading a DOCX file instead.';
  }
}

/**
 * Parse a DOCX file and extract its text content
 * @param buffer - The DOCX file buffer
 * @returns Extracted text content
 */
export async function parseDOCX(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return 'Error parsing DOCX file. Please check the file format.';
  }
}

/**
 * Parse a DOC file and extract its text content
 * Note: DOC parsing is more complex and might require additional libraries
 * @param buffer - The DOC file buffer
 * @returns Extracted text content
 */
export async function parseDOC(buffer: ArrayBuffer): Promise<string> {
  try {
    // For DOC files, we'll use mammoth as well, though it might not work perfectly
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOC:', error);
    return 'Error parsing DOC file. Please try uploading a DOCX file instead.';
  }
}

/**
 * Parse a resume file based on its extension
 * @param file - The resume file
 * @returns Extracted text content
 */
export async function parseResumeFile(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileType) {
    case 'pdf':
      return parsePDF(fileBuffer);
    case 'docx':
      return parseDOCX(fileBuffer);
    case 'doc':
      return parseDOC(fileBuffer);
    default:
      throw new Error('Unsupported file type. Please upload a PDF, DOC, or DOCX file.');
  }
} 