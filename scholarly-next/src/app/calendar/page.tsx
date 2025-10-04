'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Upload, FileText, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';

// Mock events for demo
const mockEvents = [
  {
    title: 'CS 101 - Introduction to Programming',
    date: '2025-01-15',
    time: '10:00 AM',
    type: 'class',
    location: 'Science Building Room 201'
  },
  {
    title: 'CS 101 - Introduction to Programming',
    date: '2025-01-17',
    time: '10:00 AM',
    type: 'class',
    location: 'Science Building Room 201'
  },
  {
    title: 'Assignment 1 Due',
    date: '2025-02-01',
    time: '11:59 PM',
    type: 'assignment',
    location: 'Online Submission'
  },
  {
    title: 'Work on Assignment 1',
    date: '2025-01-25',
    time: '12:00 PM',
    type: 'reminder',
    location: 'Study Time'
  },
  {
    title: 'CS 101 - Midterm Exam',
    date: '2025-03-15',
    time: '10:00 AM',
    type: 'exam',
    location: 'Science Building Room 201'
  },
  {
    title: 'Study for Midterm',
    date: '2025-03-01',
    time: '12:00 PM',
    type: 'reminder',
    location: 'Study Time'
  }
];

const getEventColor = (type: string) => {
  switch (type) {
    case 'class':
      return 'bg-blue-500';
    case 'exam':
      return 'bg-red-500';
    case 'assignment':
      return 'bg-yellow-500';
    case 'reminder':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default function CalendarPage() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Confirm
  const [eventsAdded, setEventsAdded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

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
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setStep(2);
  };

  const handleConfirmEvents = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessing(false);
    setEventsAdded(true);
    setStep(3);
  };

  const resetFlow = () => {
    setStep(1);
    setEventsAdded(false);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">Scholarly</h1>
            <span className="text-gray-500">Smart Calendar</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Smart Calendar</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Upload your syllabus and automatically generate calendar events for classes, exams, and assignments.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
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
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      isActive ? 'bg-blue-500 border-blue-500 text-white' :
                      'bg-gray-100 border-gray-300 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`ml-3 font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stepItem.label}
                    </span>
                    {index < 2 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        step > stepItem.number ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Upload Your Syllabus</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {!file ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Drop your syllabus here or click to browse</p>
                        <p className="text-sm text-gray-500">Supports PDF, DOCX, and TXT files</p>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileSelect}
                          className="mt-4"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-800">{file.name}</div>
                              <div className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={processing}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {processing ? 'Processing Syllabus...' : 'Generate Calendar Events'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Review Generated Events</h2>
                  
                  {/* Course Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Course Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Course:</span>
                        <span className="font-medium">CS 101 - Introduction to Programming</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Instructor:</span>
                        <span className="font-medium">Dr. Sarah Johnson</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="font-medium">Science Building Room 201</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Schedule:</span>
                        <span className="font-medium">MWF 10:00 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Generated Events Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Generated Calendar Events ({mockEvents.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {mockEvents.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                          <div className={`w-3 h-3 rounded-full mt-1 ${getEventColor(event.type)}`} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{event.title}</div>
                            <div className="text-sm text-gray-600">{event.date} at {event.time}</div>
                            {event.location && (
                              <div className="text-xs text-gray-500">{event.location}</div>
                            )}
                            <div className="text-xs text-blue-600 capitalize">{event.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmEvents}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {processing ? 'Adding to Calendar...' : 'Confirm & Add to Google Calendar'}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Calendar Events Added Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    Your syllabus has been processed and {mockEvents.length} events have been added to your Google Calendar.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="text-sm text-gray-600">
                      ✅ Class sessions with recurring schedule
                    </div>
                    <div className="text-sm text-gray-600">
                      ✅ Exam dates with study reminders (2 weeks prior)
                    </div>
                    <div className="text-sm text-gray-600">
                      ✅ Assignment due dates with work reminders (1 week prior)
                    </div>
                  </div>
                  <button
                    onClick={resetFlow}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                  >
                    Upload Another Syllabus
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Info Panel */}
            <div className="space-y-6">
              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-3">💡 Tips for Best Results</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Use clear, well-formatted syllabi</li>
                  <li>• Include specific dates and times</li>
                  <li>• PDFs and Word docs work best</li>
                  <li>• Check generated events before adding</li>
                </ul>
              </div>

              {/* Supported Formats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">📁 Supported Formats</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-600">PDF files (.pdf)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-600">Word documents (.docx)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    <span className="text-sm text-gray-600">Text files (.txt)</span>
                  </div>
                </div>
              </div>

              {/* What Gets Extracted */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">🔍 What We Extract</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>📚 Course name and instructor</div>
                  <div>⏰ Class meeting times</div>
                  <div>📍 Classroom locations</div>
                  <div>📅 Assignment due dates</div>
                  <div>📝 Exam schedules</div>
                  <div>🎯 Important deadlines</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}