'use client';

import { useState, useCallback } from 'react';

interface ExtractedData {
  date: string;
  hours: number;
  category: string;
  description: string;
}

interface PDFUploadProps {
  onDataExtracted: (data: ExtractedData) => void;
}

export default function PDFUpload({ onDataExtracted }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const extractCPEData = (text: string): ExtractedData | null => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let date = '';
    let hours = 0;
    let category = 'Technical';
    let description = '';

    // Common date patterns
    const datePatterns = [
      /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/i, // "December 4, 2025"
      /Class Start Date\s+(\w+\s+\d{1,2},?\s+\d{4})/i, // Deloitte format: "Class Start Date December 4, 2025"
      /Class End Date\s+(\w+\s+\d{1,2},?\s+\d{4})/i,   // Deloitte format
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
      /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
      /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/i,
      /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b/i,
    ];

    // Common hours patterns
    const hoursPatterns = [
      /Participation CPE Credits\s+(\d+(?:\.\d+)?)/i, // Deloitte format
      /CPE Credits\s+(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:CPE\s*)?(?:credit|hour|hr)s?/i,
      /(?:credit|hour|hr)s?[:\s]+(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:contact\s*)?hours?/i,
    ];

    // Category keywords
    const categoryKeywords: { [key: string]: string[] } = {
      'Ethics': ['ethics', 'ethical', 'professional conduct', 'code of conduct'],
      'Technical': ['technical', 'accounting', 'audit', 'tax', 'gaap', 'ifrs', 'financial reporting', 'information technology', 'ai', 'artificial intelligence', 'data', 'technology'],
      'Professional Skills': ['communication', 'leadership', 'management', 'consulting', 'decision-making', 'enterprise'],
      'Business': ['business', 'strategy', 'marketing', 'finance', 'economics'],
    };

    // Extract date
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsedDate = new Date(match[1]);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch {}
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

    // Extract category - first try to find CPE Subject Area
    const subjectAreaMatch = text.match(/CPE Subject Area\s+(.+?)(?:\s+Participation|\s+Class|\s+\d|$)/i);
    if (subjectAreaMatch) {
      const subjectArea = subjectAreaMatch[1].trim().toLowerCase();
      
      // Map CPE Subject Areas to categories
      if (subjectArea.includes('ethics') || subjectArea.includes('professional conduct')) {
        category = 'Ethics';
      } else if (subjectArea.includes('information technology') || subjectArea.includes('technical') || subjectArea.includes('accounting')) {
        category = 'Technical';
      } else if (subjectArea.includes('specialized knowledge')) {
        category = 'Business';
      } else if (subjectArea.includes('behavioral') || subjectArea.includes('communication') || subjectArea.includes('personal development')) {
        category = 'Professional Skills';
      } else {
        category = 'Other';
      }
    } else {
      // Fallback to keyword matching if no CPE Subject Area found
      const lowerText = text.toLowerCase();
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          category = cat;
          break;
        }
      }
    }

    // Extract description - try multiple approaches
    const descriptionPatterns = [
      // Deloitte single-line format: "...random_id Private company capital markets..."
      /[A-Za-z0-9]{20,}\s+(.+)/i,
      // Deloitte multiline format
      /FOR THE COURSE ENTITLED:\s*(.+?)(?:\s+DELIVERY METHOD|\s+Virtual|\s+Class)/i,
      /AI in action:\s*(.+?)(?:\s+DELIVERY METHOD|\s+Virtual|\s+Class)/i,
      /(?:course|title|subject|program|topic)[:\s]+(.+?)(?:\n|$)/i,
      /certificate of completion[:\s]*\n*(.+?)(?:\n|$)/i,
      /(?:webinar|seminar|conference|training|workshop)[:\s]*(.+?)(?:\n|$)/i,
    ];

    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 10) {
        description = match[1].trim();
        break;
      }
    }

    // Fallback to finding long meaningful lines
    if (!description) {
      for (const line of lines) {
        if (line.length > 30 && 
            !line.toLowerCase().includes('certificate') && 
            !line.toLowerCase().includes('completion') &&
            !line.toLowerCase().includes('deloitte') &&
            !line.toLowerCase().includes('presented to') &&
            !datePatterns.some(p => p.test(line))) {
          description = line.substring(0, 200);
          break;
        }
      }
    }

    // More lenient - if we have at least hours OR date, allow it
    if (!date && hours === 0) {
      return null;
    }

    // Use today's date if we couldn't extract one
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    // Use 1 hour as default if we couldn't extract hours
    if (hours === 0) {
      hours = 1;
    }

    return { date, hours, category, description: description || 'CPE Training' };
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Dynamic import of pdf.js to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Use the library's version to ensure compatibility
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
      }).promise;
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      // Extract CPE data
      const extractedData = extractCPEData(fullText);
      
      if (!extractedData) {
        throw new Error('Could not extract CPE data from PDF. Please enter manually.');
      }

      onDataExtracted(extractedData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Processing PDF...</p>
            </>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Upload CPE Certificate PDF
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your PDF here, or click to browse
              </p>
              <label className="cursor-pointer">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
                  Choose File
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileInput}
                />
              </label>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Error processing PDF</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">
              PDF data extracted successfully! Check the form below.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
