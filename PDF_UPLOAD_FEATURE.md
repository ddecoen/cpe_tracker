# PDF Upload Feature

## Overview
This feature allows users to upload CPE (Continuing Professional Education) certificate PDFs and automatically extract relevant information including date, hours, category, and description.

## Implementation Details

### 1. Dependencies Added
- **pdf-parse** (`^1.1.1`): A Node.js library for parsing PDF files and extracting text content

### 2. New Files Created

#### `/app/api/extract-pdf/route.ts`
- **Purpose**: Backend API endpoint for processing PDF uploads
- **Functionality**:
  - Accepts PDF file uploads via POST request
  - Converts uploaded file to buffer and parses with pdf-parse
  - Extracts text content and analyzes it for CPE data
  - Returns structured JSON with extracted fields

#### `/app/components/PDFUpload.tsx`
- **Purpose**: Frontend component for PDF upload UI
- **Features**:
  - Drag and drop functionality
  - File browser fallback
  - Loading state with spinner
  - Success/error feedback
  - Visual feedback for drag events

### 3. Modified Files

#### `/app/page.tsx`
- Added import for PDFUpload component
- Added `handlePDFDataExtracted` function to auto-fill form fields
- Integrated PDFUpload component above the manual entry form

#### `/package.json`
- Added pdf-parse dependency

#### `/README.md`
- Updated features list to highlight PDF upload
- Updated usage instructions with PDF upload workflow

## Data Extraction Logic

The PDF parser uses multiple pattern matching strategies:

### Date Extraction
- Supports multiple date formats:
  - `MM/DD/YYYY` or `MM-DD-YYYY`
  - `YYYY/MM/DD` or `YYYY-MM-DD`
  - `Month DD, YYYY` (e.g., "January 15, 2024")
  - `DD Month YYYY` (e.g., "15 January 2024")

### Hours Extraction
- Matches patterns like:
  - "X CPE credits/hours"
  - "Credits: X"
  - "X contact hours"

### Category Detection
- Keyword-based categorization:
  - **Ethics**: ethics, ethical, professional conduct
  - **Technical**: technical, accounting, audit, tax, GAAP, IFRS
  - **Professional Skills**: communication, leadership, management
  - **Business**: business, strategy, marketing, finance

### Description Extraction
- Looks for common patterns:
  - Course/Title/Subject fields
  - Certificate of completion text
  - Webinar/Seminar/Conference names
- Falls back to first substantial text line

## User Experience Flow

1. User drags PDF file into upload area or clicks to browse
2. Component validates file type (must be PDF)
3. Shows loading spinner while processing
4. Sends file to API endpoint
5. API extracts text and parses data
6. On success:
   - Shows green success message
   - Auto-fills form fields with extracted data
   - User can review/edit before submitting
7. On error:
   - Shows red error message with details
   - User can try different file or enter manually

## Error Handling

- **Client-side validation**: Checks file type before upload
- **API validation**: Verifies file exists and can be parsed
- **Extraction validation**: Ensures minimum required data (date and hours)
- **User feedback**: Clear error messages for all failure scenarios

## Future Enhancements

Potential improvements:
- Support for image-based PDFs using OCR
- Machine learning for improved extraction accuracy
- Support for multiple PDF formats/templates
- Batch upload functionality
- Save extraction templates for specific providers

## Testing Recommendations

1. Test with various CPE certificate formats
2. Test drag and drop vs. file browser
3. Test with non-PDF files
4. Test with malformed/corrupted PDFs
5. Test with image-only PDFs
6. Test extraction accuracy across different certificate providers
