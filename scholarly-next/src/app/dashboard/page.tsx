'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, Award, BarChart3, MessageCircle, Send } from 'lucide-react';
import ChatBar from '@/components/ChatBar';
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import CoursesWidget from '@/components/CoursesWidget';
import AssignmentsWidget from '@/components/AssignmentsWidget';
import GradesWidget from '@/components/GradesWidget';
import StatsWidget from '@/components/StatsWidget';
// Mock dat// Mock data for widgets

export default function DashboardPage() {
  console.log('🚀 Dashboard: Page component mounted/re-rendered at:', new Date().toISOString());
  console.log('🚀 Dashboard: Environment check - Canvas Base URL exists:', !!process.env.NEXT_PUBLIC_CANVAS_BASE_URL);
  console.log('🚀 Dashboard: Environment check - Canvas Token exists:', !!process.env.NEXT_PUBLIC_CANVAS_ACCESS_TOKEN);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Scholarly</h1>
              <span className="text-gray-500">Academic Dashboard</span>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-blue-600 font-medium"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link 
                href="/calendar"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Smart Calendar</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Demo Student</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Here's what's happening with your academic life today.</p>
          </div>

          <ChatBar />
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <CoursesWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <AssignmentsWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <GradesWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 md:col-span-2 lg:col-span-1">
              <StatsWidget />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}