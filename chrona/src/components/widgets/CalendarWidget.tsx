'use client';

import { Calendar as CalendarIcon, Upload, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CalendarWidget() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Quick Actions
        </h3>
      </div>

      {/* Upload Syllabus Card */}
      <button
        onClick={() => router.push('/calendar')}
        className="w-full p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all duration-300 hover:scale-105 group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            <Upload className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-white mb-1">Upload Syllabus</div>
            <div className="text-sm text-gray-400">
              Automatically generate calendar events
            </div>
          </div>
        </div>
      </button>

      {/* Calendar Integration Card */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white mb-2">Google Calendar</div>
            <div className="text-sm text-gray-400 mb-4">
              Sync your academic schedule with Google Calendar
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-blue-400">✓</span>
          </div>
          <span>Auto-detect classes & exams</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-blue-400">✓</span>
          </div>
          <span>Smart reminders & notifications</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-blue-400">✓</span>
          </div>
          <span>Course emoji & color coding</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => router.push('/calendar')}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Manage Calendar</span>
      </button>
    </div>
  );
}
