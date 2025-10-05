'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Upload, FileText, Clock, MapPin, User, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { callGeminiForEventParsing, SyllabusEvent, CourseInfo } from '@/lib/gemini';
import { getUserTimezone, getCommonTimezones } from '@/lib/googleCalendar';
import * as pdfjsLib from 'pdfjs-dist';
import MiniCalendar from '@/components/MiniCalendar';
import EventCard from '@/components/EventCard';
import { Plus } from 'lucide-react';

// Emoji mapping for different course subjects
const getCourseEmoji = (courseCode: string): string => {
  const code = courseCode.toLowerCase();

  // Language courses
  if (code.includes('italian') || code.includes('itallang')) return '🇮🇹';
  if (code.includes('spanish') || code.includes('span')) return '🇪🇸';
  if (code.includes('french') || code.includes('fren')) return '🇫🇷';
  if (code.includes('german') || code.includes('germ')) return '🇩🇪';
  if (code.includes('chinese') || code.includes('chin')) return '🇨🇳';
  if (code.includes('japanese') || code.includes('jpn')) return '🇯🇵';
  if (code.includes('arabic') || code.includes('arab')) return '🇸🇦';
  if (code.includes('russian') || code.includes('russ')) return '🇷🇺';

  // STEM courses
  if (code.includes('cs') || code.includes('compsci') || code.includes('comp sci')) return '💻';
  if (code.includes('math') || code.includes('calc') || code.includes('algebra')) return '📐';
  if (code.includes('physics') || code.includes('phys')) return '⚛️';
  if (code.includes('chem') || code.includes('chemistry')) return '🧪';
  if (code.includes('bio') || code.includes('biology')) return '🧬';
  if (code.includes('eng') || code.includes('engineering')) return '⚙️';
  if (code.includes('data') || code.includes('ai') || code.includes('ml')) return '🤖';

  // Humanities & Social Sciences
  if (code.includes('hist') || code.includes('history')) return '📜';
  if (code.includes('phil') || code.includes('philosophy')) return '💭';
  if (code.includes('psych') || code.includes('psychology')) return '🧠';
  if (code.includes('econ') || code.includes('economics')) return '📊';
  if (code.includes('pol') || code.includes('political')) return '🏛️';
  if (code.includes('soc') || code.includes('sociology')) return '👥';
  if (code.includes('anthro') || code.includes('anthropology')) return '🗿';

  // Arts & Literature
  if (code.includes('art') || code.includes('studio')) return '🎨';
  if (code.includes('music') || code.includes('mus')) return '🎵';
  if (code.includes('engl') || code.includes('lit') || code.includes('writing')) return '📚';
  if (code.includes('film') || code.includes('cinema')) return '🎬';
  if (code.includes('theater') || code.includes('drama')) return '🎭';

  // Other
  if (code.includes('business') || code.includes('mba')) return '💼';
  if (code.includes('law') || code.includes('legal')) return '⚖️';
  if (code.includes('med') || code.includes('health')) return '🏥';
  if (code.includes('pe') || code.includes('kines') || code.includes('sport')) return '⚽';

  // Default
  return '📖';
};

// Format event title with emoji and course code prefix
const formatEventTitle = (title: string, courseCode?: string): string => {
  if (!courseCode) return title;

  const emoji = getCourseEmoji(courseCode);
  const prefix = `${emoji} ${courseCode}:`;

  // Check if title already has the prefix
  if (title.startsWith(emoji) || title.includes(courseCode)) {
    return title;
  }

  return `${prefix} ${title}`;
};

// Set up PDF.js worker - serve from local public folder
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.min.mjs';
}

// Helper function to extract text from PDF using PDF.js
async function extractTextFromPDF(file: File): Promise<string> {
  console.log('📄 Starting PDF extraction for:', file.name);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        console.log('📦 PDF loaded, size:', arrayBuffer.byteLength, 'bytes');

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        console.log('📖 PDF has', pdf.numPages, 'pages');

        let fullText = '';

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');

          fullText += pageText + '\n';
          console.log(`📄 Page ${pageNum} extracted: ${pageText.length} chars`);
        }

        const cleanedText = fullText.trim();
        console.log('✅ Total extracted text:', cleanedText.length, 'characters');
        console.log('📝 Preview (first 500 chars):', cleanedText.slice(0, 500));

        if (!cleanedText || cleanedText.length < 50) {
          reject(new Error('Could not extract meaningful text from PDF'));
        } else {
          resolve(cleanedText);
        }
      } catch (error) {
        console.error('❌ PDF extraction error:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      console.error('❌ FileReader error');
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Helper function to extract text from TXT files
async function extractTextFromTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      resolve(text || '');
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Confirm
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [events, setEvents] = useState<SyllabusEvent[]>([]);
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(getUserTimezone());
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF, DOCX, or TXT file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      console.log('🚀 Starting upload process for file:', file.name, 'Type:', file.type);

      // Extract text from file based on type
      let extractedText: string;

      if (file.type === 'application/pdf') {
        console.log('📄 Processing as PDF...');
        extractedText = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain') {
        console.log('📝 Processing as TXT...');
        extractedText = await extractTextFromTXT(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('📄 Processing as DOCX (using TXT fallback)...');
        // For DOCX, we'd need a library - for now treat as text
        extractedText = await extractTextFromTXT(file);
      } else {
        throw new Error('Unsupported file type');
      }

      console.log('✅ Extraction complete! Length:', extractedText.length, 'characters');
      console.log('📊 Sending to Gemini API...');

      // Call Gemini to parse the syllabus
      const result = await callGeminiForEventParsing(extractedText);

      console.log('🎉 Gemini returned', result.events.length, 'events');
      console.log('📋 Course Info:', result.courseInfo);
      console.log('📋 Events:', result.events);

      // Format event titles with emoji + course code prefix
      const formattedEvents = result.events.map((event) => ({
        ...event,
        title: formatEventTitle(event.title, result.courseInfo.courseCode),
      }));

      console.log('✨ Formatted events with emoji prefixes');

      // Update state with parsed events and course info
      setEvents(formattedEvents);
      setCourseInfo(result.courseInfo);
      setProcessing(false);
      setStep(2);
    } catch (err) {
      console.error('❌ Error processing syllabus:', err);
      setError(err instanceof Error ? err.message : 'Failed to process syllabus');
      setProcessing(false);
    }
  };

  const handleConfirmEvents = async () => {
    // Check if user is authenticated
    if (status !== 'authenticated' || !session) {
      // Redirect to sign in
      signIn('google', { callbackUrl: '/calendar' });
      return;
    }

    // Check for session errors
    if (session.error) {
      setError('Your session has expired. Please sign in again.');
      signIn('google', { callbackUrl: '/calendar' });
      return;
    }

    setProcessing(true);
    setError(null);
    setSyncProgress(null);

    try {
      // Call the API to add events to Google Calendar
      const response = await fetch('/api/calendar/add-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          courseInfo,
          timezone: selectedTimezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add events to Google Calendar');
      }

      console.log('✅ Successfully added events to Google Calendar:', data.result);

      // Show success even if some events failed
      if (data.result.failed > 0) {
        console.warn(`⚠️ ${data.result.failed} events failed to sync:`, data.result.errors);
      }

      setProcessing(false);
      setStep(3);
    } catch (err) {
      console.error('❌ Error syncing to Google Calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to add events to Google Calendar');
      setProcessing(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setFile(null);
    setEvents([]);
    setCourseInfo({});
    setError(null);
    setSelectedDate(null);
    setIsAddingEvent(false);
  };

  // Get dates with events for mini calendar
  const getEventDates = () => {
    const dates = new Set<string>();
    events.forEach((event) => {
      try {
        // Parse MM/DD/YYYY format
        const [month, day, year] = event.date.split('/');
        if (month && day && year) {
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          dates.add(dateObj.toISOString().split('T')[0]);
        }
      } catch (e) {
        // Skip invalid dates
      }
    });
    return dates;
  };

  // Filter events by selected date
  const filteredEvents = selectedDate
    ? events.filter((event) => {
        try {
          const [month, day, year] = event.date.split('/');
          if (month && day && year) {
            const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return eventDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          return false;
        }
        return false;
      })
    : events;

  // Update an event
  const handleEventUpdate = (index: number, updatedEvent: SyllabusEvent) => {
    const newEvents = [...events];
    newEvents[index] = updatedEvent;
    setEvents(newEvents);
  };

  // Delete an event
  const handleEventDelete = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  // Add a new blank event
  const handleAddEvent = () => {
    const newEvent: SyllabusEvent = {
      title: formatEventTitle('New Event', courseInfo.courseCode),
      date: new Date().toLocaleDateString('en-US'),
      type: 'class',
    };
    setEvents([...events, newEvent]);
    setIsAddingEvent(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Back to Dashboard Button */}
            {status === 'authenticated' && (
              <button
                onClick={() => router.push('/dashboard/space')}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
              </button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Chrona
            </h1>
            <span className="text-zinc-400">Smart Calendar</span>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
            ) : status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{session.user.name}</div>
                  <div className="text-xs text-zinc-400">{session.user.email}</div>
                </div>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-indigo-500"
                  />
                )}
                <button
                  onClick={() => signIn('google')}
                  className="ml-2 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google', { callbackUrl: '/calendar' })}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-4">
              <CalendarIcon className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">Smart Calendar</h1>
            </div>
            <p className="text-zinc-400 text-lg">
              Upload your syllabus and automatically generate calendar events for classes, exams, and assignments.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-center space-x-8">
              {[
                { number: 1, label: 'Upload Syllabus', icon: Upload },
                { number: 2, label: 'Review Events', icon: FileText },
                { number: 3, label: 'Add to Calendar', icon: CalendarIcon }
              ].map((stepItem, index) => {
                const StepIcon = stepItem.icon;
                const isActive = step === stepItem.number;
                const isCompleted = step > stepItem.number;

                return (
                  <div key={stepItem.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20' :
                      isActive ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/20' :
                      'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`ml-3 font-medium transition-colors ${
                      isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                      {stepItem.label}
                    </span>
                    {index < 2 && (
                      <div className={`w-16 h-0.5 mx-4 transition-all duration-500 ${
                        step > stepItem.number ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className={`grid grid-cols-1 gap-8 ${step === 1 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            {/* Left Column - Main Content */}
            <div className={step === 1 ? 'lg:col-span-2' : ''}>
              {step === 1 && (
                <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                  <h2 className="text-2xl font-semibold text-white mb-6">Step 1: Upload Your Syllabus</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    {!file ? (
                      <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-xl p-12 text-center transition-all duration-300 group">
                        <div className="bg-zinc-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-colors">
                          <Upload className="w-10 h-10 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-white text-lg mb-2 font-medium">Drop your syllabus here or click to browse</p>
                        <p className="text-sm text-zinc-500 mb-6">Supports PDF, DOCX, and TXT files</p>
                        <label className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg cursor-pointer transition-colors">
                          <Upload className="w-5 h-5 mr-2" />
                          Choose File
                          <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="bg-indigo-500/20 p-3 rounded-lg">
                              <FileText className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{file.name}</div>
                              <div className="text-sm text-zinc-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                        </div>
                        {error && (
                          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl animate-fadeInUp">
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-rose-300">Error</p>
                                <p className="text-sm text-rose-200/80">{error}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleUpload}
                          disabled={processing}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                                     text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200
                                     hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                                     flex items-center justify-center gap-2"
                        >
                          {processing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing Syllabus...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Generate Calendar Events
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="min-h-screen bg-zinc-950 -mx-6 -my-8 px-6 py-8">
                  {/* Header Section */}
                  <div className="mb-8 animate-slideIn">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Review & Edit Events ✨
                    </h1>
                    <p className="text-zinc-400 text-lg">
                      {courseInfo.courseCode && courseInfo.courseName
                        ? `${courseInfo.courseCode} - ${courseInfo.courseName}`
                        : 'Review your calendar events'} • {filteredEvents.length} {selectedDate ? 'on this day' : 'total events'}
                    </p>
                  </div>

                  {/* Main Layout: Calendar + Events Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
                    {/* Left: Mini Calendar */}
                    <div className="animate-slideIn" style={{ animationDelay: '100ms' }}>
                      <MiniCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        eventDates={getEventDates()}
                      />

                      {/* Course Info Card */}
                      {(courseInfo.instructor || courseInfo.location || courseInfo.schedule) && (
                        <div className="mt-6 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                            Course Info
                          </h3>
                          <div className="space-y-3">
                            {courseInfo.instructor && (
                              <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-300">{courseInfo.instructor}</span>
                              </div>
                            )}
                            {courseInfo.location && (
                              <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-300">{courseInfo.location}</span>
                              </div>
                            )}
                            {courseInfo.schedule && (
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-300">{courseInfo.schedule}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Events Grid */}
                    <div>
                      {/* Events Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {filteredEvents.map((event, index) => {
                          const actualIndex = events.indexOf(event);
                          return (
                            <EventCard
                              key={actualIndex}
                              event={event}
                              onUpdate={(updated) => handleEventUpdate(actualIndex, updated)}
                              onDelete={() => handleEventDelete(actualIndex)}
                              index={index}
                            />
                          );
                        })}

                        {/* Add Event Card */}
                        {isAddingEvent ? (
                          <div
                            className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl
                              border border-dashed border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center
                              animate-fadeInUp"
                          >
                            <Plus className="w-12 h-12 text-zinc-600 mb-4" />
                            <p className="text-zinc-400 mb-4">Add a new event manually</p>
                            <div className="flex gap-2">
                              <button
                                onClick={handleAddEvent}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Create Event
                              </button>
                              <button
                                onClick={() => setIsAddingEvent(false)}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Timezone Selector */}
                      <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <label htmlFor="timezone" className="block text-sm font-semibold text-white mb-3">
                          📍 Select Your Timezone
                        </label>
                        <select
                          id="timezone"
                          value={selectedTimezone}
                          onChange={(e) => setSelectedTimezone(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {getCommonTimezones().map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-zinc-400">
                          This timezone will be used for all calendar events
                        </p>
                      </div>

                      {/* Error Display */}
                      {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl animate-fadeInUp">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-rose-300">Error</p>
                              <p className="text-sm text-rose-200/80">{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 sticky bottom-8 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                        <button
                          onClick={() => setIsAddingEvent(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-zinc-800 hover:bg-zinc-700
                                     text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
                        >
                          <Plus className="w-5 h-5" />
                          Add Event
                        </button>
                        <button
                          onClick={handleConfirmEvents}
                          disabled={processing}
                          className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600
                                     hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl
                                     transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <CalendarIcon className="w-5 h-5" />
                          {processing ? 'Syncing to Google Calendar...' :
                            status === 'authenticated'
                              ? `Add ${events.length} Events to Google Calendar`
                              : 'Sign in to Add to Google Calendar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-16 animate-fadeInUp">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Calendar Events Added Successfully! 🎉</h2>
                  <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                    Your syllabus has been processed and <span className="text-emerald-400 font-semibold">{events.length} events</span> have been added to your Google Calendar.
                  </p>

                  {/* View Calendar Button */}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl mb-8"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    View in Google Calendar
                  </a>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-zinc-300">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-400">✓</span>
                        </div>
                        <span>Class sessions with recurring schedule</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-300">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-400">✓</span>
                        </div>
                        <span>Exam dates with study reminders (2 weeks prior)</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-300">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-400">✓</span>
                        </div>
                        <span>Assignment due dates with work reminders (1 week prior)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={resetFlow}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                                 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50"
                    >
                      Upload Another Syllabus
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Info Panel (only show on Step 1) */}
            {step === 1 && (
            <div className="space-y-6">
              {/* Tips */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                <h3 className="font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Tips for Best Results
                </h3>
                <ul className="text-sm text-zinc-300 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>Use clear, well-formatted syllabi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>Include specific dates and times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>PDFs and Word docs work best</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>Check generated events before adding</span>
                  </li>
                </ul>
              </div>

              {/* Supported Formats */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📁</span>
                  Supported Formats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50" />
                    <span className="text-sm text-zinc-300">PDF files (.pdf)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
                    <span className="text-sm text-zinc-300">Word documents (.docx)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                    <span className="text-sm text-zinc-300">Text files (.txt)</span>
                  </div>
                </div>
              </div>

              {/* What Gets Extracted */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  What We Extract
                </h3>
                <div className="space-y-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span>📚</span> Course name and instructor
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏰</span> Class meeting times
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍</span> Classroom locations
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span> Assignment due dates
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📝</span> Exam schedules
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🎯</span> Important deadlines
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}