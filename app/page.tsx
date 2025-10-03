'use client';

import { useState, useEffect } from 'react';

interface CPEEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  category: string;
}

export default function Home() {
  const [entries, setEntries] = useState<CPEEntry[]>([]);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical');

  const TOTAL_REQUIRED = 80;
  const ANNUAL_MINIMUM = 20;
  const currentYear = new Date().getFullYear();
  const reportingYear = currentYear % 2 === 0 ? currentYear + 1 : currentYear;

  useEffect(() => {
    const stored = localStorage.getItem('cpeEntries');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('cpeEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const progressPercentage = Math.min((totalHours / TOTAL_REQUIRED) * 100, 100);
  const hoursRemaining = Math.max(TOTAL_REQUIRED - totalHours, 0);

  // Calculate hours per year for the two-year reporting period
  const year1 = reportingYear - 1;
  const year2 = reportingYear;
  
  const year1Hours = entries
    .filter(entry => new Date(entry.date).getFullYear() === year1)
    .reduce((sum, entry) => sum + entry.hours, 0);
  
  const year2Hours = entries
    .filter(entry => new Date(entry.date).getFullYear() === year2)
    .reduce((sum, entry) => sum + entry.hours, 0);

  const year1NeedsMore = year1Hours < ANNUAL_MINIMUM;
  const year2NeedsMore = year2Hours < ANNUAL_MINIMUM;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !hours || !description) return;

    const newEntry: CPEEntry = {
      id: Date.now().toString(),
      date,
      hours: parseFloat(hours),
      description,
      category
    };

    setEntries([...entries, newEntry]);
    setDate('');
    setHours('');
    setDescription('');
    setCategory('Technical');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all entries?')) {
      setEntries([]);
      localStorage.removeItem('cpeEntries');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CPE Tracker</h1>
          <p className="text-gray-600 mb-4">Pennsylvania CPA License Requirements</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Required</p>
                <p className="text-2xl font-bold text-blue-600">{TOTAL_REQUIRED} hrs</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Annual Minimum</p>
                <p className="text-2xl font-bold text-blue-600">{ANNUAL_MINIMUM} hrs/year</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reporting Year</p>
                <p className="text-2xl font-bold text-blue-600">{reportingYear}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{totalHours} / {TOTAL_REQUIRED} hours</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 10 && (
                  <span className="text-white text-xs font-semibold">{progressPercentage.toFixed(0)}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Hours Remaining and Yearly Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Hours Remaining</p>
              <p className="text-3xl font-bold text-green-600">{hoursRemaining}</p>
              <p className="text-xs text-gray-500 mt-1">to reach {TOTAL_REQUIRED} hours</p>
            </div>
            
            <div className={`border rounded-lg p-4 text-center ${
              year1NeedsMore 
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">{year1} Hours</p>
              <p className={`text-3xl font-bold ${
                year1NeedsMore ? 'text-yellow-600' : 'text-blue-600'
              }`}>{year1Hours}</p>
              <p className={`text-xs mt-1 ${
                year1NeedsMore ? 'text-yellow-700 font-medium' : 'text-gray-500'
              }`}>
                {year1NeedsMore ? `Need ${ANNUAL_MINIMUM - year1Hours} more` : `${ANNUAL_MINIMUM} min met ✓`}
              </p>
            </div>
            
            <div className={`border rounded-lg p-4 text-center ${
              year2NeedsMore 
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">{year2} Hours</p>
              <p className={`text-3xl font-bold ${
                year2NeedsMore ? 'text-yellow-600' : 'text-blue-600'
              }`}>{year2Hours}</p>
              <p className={`text-xs mt-1 ${
                year2NeedsMore ? 'text-yellow-700 font-medium' : 'text-gray-500'
              }`}>
                {year2NeedsMore ? `Need ${ANNUAL_MINIMUM - year2Hours} more` : `${ANNUAL_MINIMUM} min met ✓`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Technical</option>
                <option>Professional Skills</option>
                <option>Ethics</option>
                <option>Business</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add CPE Entry
            </button>
          </form>
        </div>

        {entries.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">CPE History</h2>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">{entry.date}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{entry.category}</span>
                        <span className="font-semibold text-blue-600">{entry.hours} hrs</span>
                      </div>
                      <p className="text-gray-700">{entry.description}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
