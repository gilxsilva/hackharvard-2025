'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, Award, BarChart3, MessageCircle, Send } from 'lucide-react';
import ChatBar from '@/components/ChatBar';

// Mock data for widgets
const mockAssignments = [
  { id: 1, title: 'Data Structures Assignment', course: 'CS 201', dueDate: '2025-01-20', priority: 'high' },
  { id: 2, title: 'Calculus Problem Set', course: 'MATH 101', dueDate: '2025-01-25', priority: 'medium' },
  { id: 3, title: 'Physics Lab Report', course: 'PHYS 201', dueDate: '2025-01-30', priority: 'medium' }
];

const mockGrades = [
  { id: 1, course: 'CS 201', assignment: 'Midterm Exam', grade: 'A-', points: 3.7 },
  { id: 2, course: 'MATH 101', assignment: 'Quiz 3', grade: 'B+', points: 3.3 },
  { id: 3, course: 'PHYS 201', assignment: 'Lab Report 2', grade: 'A', points: 4.0 }
];

const mockEvents = [
  { id: 1, title: 'CS 101 - Lecture', time: '10:00 AM', location: 'Science Building Room 201' },
  { id: 2, title: 'Math 201 - Tutorial', time: '2:00 PM', location: 'Math Building Room 105' }
];

function ScheduleWidget() {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Today's Schedule</h3>
      </div>
      <div className="space-y-3">
        {mockEvents.map((event) => (
          <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
            <div className="font-medium text-gray-800">{event.title}</div>
            <div className="text-sm text-gray-600">{event.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentsWidget() {
  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Upcoming Assignments</h3>
      </div>
      <div className="space-y-3">
        {mockAssignments.map((assignment) => {
          const daysUntil = getDaysUntilDue(assignment.dueDate);
          return (
            <div key={assignment.id} className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium text-gray-800">{assignment.title}</div>
              <div className="text-sm text-gray-600">{assignment.course}</div>
              <div className="text-xs text-blue-600">Due in {daysUntil} days</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GradesWidget() {
  const calculateGPA = (grades: typeof mockGrades) => {
    const total = grades.reduce((sum, grade) => sum + grade.points, 0);
    return (total / grades.length).toFixed(2);
  };

  const gpa = calculateGPA(mockGrades);

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Award className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Academic Performance</h3>
      </div>
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current GPA</span>
          <span className="font-bold text-lg text-gray-800">{gpa}</span>
        </div>
      </div>
      <div className="space-y-2">
        {mockGrades.map((grade) => (
          <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div>
              <div className="text-sm font-medium text-gray-800">{grade.course}</div>
              <div className="text-xs text-gray-600">{grade.assignment}</div>
            </div>
            <div className="font-bold text-green-600">{grade.grade}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsWidget() {
  const stats = [
    { label: 'Classes This Week', value: '12', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Study Hours', value: '24', icon: Calendar, color: 'text-green-600' },
    { label: 'Assignments Due', value: '5', icon: Award, color: 'text-orange-600' },
    { label: 'Progress', value: '85%', icon: BarChart3, color: 'text-purple-600' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Weekly Overview</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-md">
              <IconComponent className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="font-bold text-lg text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
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
              <ScheduleWidget />
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