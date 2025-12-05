import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

interface ExtractedData {
  date: string;
  hours: number;
  category: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const data = await pdf(buffer);
    const text = data.text;

    // Extract relevant information
    const extracted = extractCPEData(text);

    if (!extracted) {
      return NextResponse.json(
        { error: 'Could not extract CPE data from PDF', rawText: text },
        { status: 400 }
      );
    }

    return NextResponse.json(extracted);
  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function extractCPEData(text: string): ExtractedData | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let date = '';
  let hours = 0;
  let category = 'Technical';
  let description = '';

  // Common date patterns
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,  // MM/DD/YYYY or MM-DD-YYYY
    /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,    // YYYY/MM/DD or YYYY-MM-DD
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/i, // Month DD, YYYY
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b/i, // DD Month YYYY
  ];

  // Common hours patterns
  const hoursPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:CPE\s*)?(?:credit|hour|hr)s?/i,
    /(?:credit|hour|hr)s?[:\s]+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:contact\s*)?hours?/i,
  ];

  // Common category keywords
  const categoryKeywords: { [key: string]: string[] } = {
    'Ethics': ['ethics', 'ethical', 'professional conduct', 'code of conduct'],
    'Technical': ['technical', 'accounting', 'audit', 'tax', 'gaap', 'ifrs', 'financial reporting', 'attestation'],
    'Professional Skills': ['communication', 'leadership', 'management', 'consulting', 'professional skills'],
    'Business': ['business', 'strategy', 'marketing', 'finance', 'economics'],
  };

  // Extract date
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      date = normalizeDate(match[1]);
      break;
    }
  }

  // Extract hours
  for (const pattern of hoursPatterns) {
    const match = text.match(pattern);
    if (match) {
      hours = parseFloat(match[1]);
      break;
    }
  }

  // Extract category
  const lowerText = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      category = cat;
      break;
    }
  }

  // Extract description - use title/course name or first few meaningful lines
  const descriptionPatterns = [
    /(?:course|title|subject|program|topic)[:\s]+(.+?)(?:\n|$)/i,
    /certificate of completion[:\s]*\n*(.+?)(?:\n|$)/i,
    /(?:webinar|seminar|conference|training|workshop)[:\s]*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 5) {
      description = match[1].trim();
      break;
    }
  }

  // Fallback: use first substantial line that's not a date or header
  if (!description) {
    for (const line of lines) {
      if (line.length > 15 && 
          !line.toLowerCase().includes('certificate') && 
          !line.toLowerCase().includes('completion') &&
          !datePatterns.some(p => p.test(line))) {
        description = line.substring(0, 200); // Limit length
        break;
      }
    }
  }

  // Return null if we couldn't extract minimum required data
  if (!date || hours === 0) {
    return null;
  }

  return {
    date,
    hours,
    category,
    description: description || 'CPE Training'
  };
}

function normalizeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    // Return in YYYY-MM-DD format for HTML date input
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}
