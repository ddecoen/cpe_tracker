# CPE Tracker for CPA License

A web application to track Continuing Professional Education (CPE) requirements for Pennsylvania CPA license.

## Pennsylvania CPE Requirements

- **Total Required**: 80 hours every other year (odd years)
- **Annual Minimum**: 20 hours per year
- **Reporting Period**: Odd-numbered years

## Features

- ✅ Add and track CPE entries with date, hours, category, and description
- 📊 Visual progress bar showing completion percentage
- 💾 Data persisted in browser local storage
- 🗑️ Delete individual entries or clear all data
- 📱 Responsive design for mobile and desktop
- 🎨 Clean, modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Browser LocalStorage

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

This project is optimized for Vercel deployment. Follow these steps:

### Step-by-Step Deployment

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select `ddecoen/cpe_tracker`

3. **Configure Project**
   - Vercel will automatically detect Next.js
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Quick Deploy Button

Alternatively, click the button below to deploy directly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ddecoen/cpe_tracker)

### After Deployment

- **Automatic Updates**: Every push to the `main` branch will automatically trigger a new deployment
- **Custom Domain**: You can add a custom domain in the Vercel project settings
- **Environment**: The app runs entirely in the browser, so no environment variables are needed

## Usage

1. **Add CPE Entry**: Fill in the form with the date, hours, category, and description of your CPE activity
2. **Track Progress**: View your total hours and progress toward the 80-hour requirement
3. **Review History**: See all your CPE entries sorted by date
4. **Delete Entries**: Remove individual entries or clear all data

## Data Storage

All data is stored locally in your browser using LocalStorage. Your CPE data:
- Persists between sessions
- Stays private on your device
- Is not sent to any server
- Can be cleared using the "Clear All" button
