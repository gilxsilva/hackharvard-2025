'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, BookOpen, Award, BarChart3, MessageCircle, Send } from 'lucide-react';
import ChatBar from '@/components/ChatBar';
import { fetchUpcomingAssignments, fetchCanvasCourses, type CanvasAssignment, type CanvasCourse } from '@/lib/canvasApi';

// Mock dat// Mock data for widgets
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

function CoursesWidget() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📚 CoursesWidget: Starting to load Canvas courses...');
        console.log('📚 CoursesWidget: Current timestamp:', new Date().toISOString());
        
        const canvasCourses = await fetchCanvasCourses();
        
        console.log('📚 CoursesWidget: Raw courses response:', canvasCourses);
        console.log('📚 CoursesWidget: Number of courses received:', canvasCourses.length);
        console.log('📚 CoursesWidget: Course data types and structure:');
        
        if (canvasCourses.length > 0) {
          const sampleCourse = canvasCourses[0];
          console.log('📚 CoursesWidget: Sample course object:', sampleCourse);
          console.log('📚 CoursesWidget: Sample course keys:', Object.keys(sampleCourse));
          console.log('📚 CoursesWidget: Sample course ID type:', typeof sampleCourse.id);
          console.log('📚 CoursesWidget: Sample course name type:', typeof sampleCourse.name);
        }
        
        setCourses(canvasCourses);
        console.log('📚 CoursesWidget: Successfully set courses state');
        
      } catch (error) {
        console.error('❌ CoursesWidget: Failed to load Canvas courses:', error);
        console.error('❌ CoursesWidget: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        setError('Failed to load courses from Canvas');
      } finally {
        setLoading(false);
        console.log('📚 CoursesWidget: Loading complete at:', new Date().toISOString());
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">My Courses</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-800">My Courses</h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <p className="text-red-600 text-xs mt-1">Check console for details</p>
        </div>
      )}
      
      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">No active courses found</p>
            <p className="text-yellow-600 text-xs mt-1">Check Canvas enrollment status</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors border-l-4 border-green-500">
              <div className="font-medium text-gray-800">{course.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {course.course_code && `${course.course_code} • `}
                Course ID: {course.id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AssignmentsWidget() {
  const [assignments, setAssignments] = useState<(CanvasAssignment & { course_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🎯 AssignmentsWidget: =================================');
        console.log('🎯 AssignmentsWidget: Starting to load Canvas assignments...');
        console.log('🎯 AssignmentsWidget: Current timestamp:', new Date().toISOString());
        
        const canvasAssignments = await fetchUpcomingAssignments();
        
        console.log('🎯 AssignmentsWidget: Raw assignments response:', canvasAssignments);
        console.log('🎯 AssignmentsWidget: Number of assignments received:', canvasAssignments.length);
        console.log('🎯 AssignmentsWidget: Assignment data analysis:');
        
        if (canvasAssignments.length > 0) {
          const sampleAssignment = canvasAssignments[0];
          console.log('🎯 AssignmentsWidget: Sample assignment object:', sampleAssignment);
          console.log('🎯 AssignmentsWidget: Sample assignment keys:', Object.keys(sampleAssignment));
          console.log('🎯 AssignmentsWidget: Assignment field types:', {
            id: typeof sampleAssignment.id,
            name: typeof sampleAssignment.name,
            due_at: typeof sampleAssignment.due_at,
            points_possible: typeof sampleAssignment.points_possible,
            course_name: typeof sampleAssignment.course_name,
            html_url: typeof sampleAssignment.html_url
          });
          
          console.log('🎯 AssignmentsWidget: Due dates analysis:');
          canvasAssignments.slice(0, 3).forEach((assignment: any, index: number) => {
            console.log(`   ${index + 1}. ${assignment.name}`);
            console.log(`      Due: ${assignment.due_at}`);
            console.log(`      Parsed Date: ${new Date(assignment.due_at!)}`);
            console.log(`      Days until due: ${Math.ceil((new Date(assignment.due_at!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}`);
          });
        } else {
          console.log('🎯 AssignmentsWidget: No assignments received - checking why...');
        }
        
        const displayAssignments = canvasAssignments.slice(0, 5);
        setAssignments(displayAssignments);
        console.log('🎯 AssignmentsWidget: Set state with assignments for display:', displayAssignments.length);
        console.log('🎯 AssignmentsWidget: Final display assignments:', displayAssignments);
        
      } catch (error) {
        console.error('❌ AssignmentsWidget: Failed to load Canvas assignments:', error);
        console.error('❌ AssignmentsWidget: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        setError('Failed to load assignments from Canvas');
        setAssignments([]);
      } finally {
        setLoading(false);
        console.log('🎯 AssignmentsWidget: Loading complete at:', new Date().toISOString());
        console.log('🎯 AssignmentsWidget: =================================');
      }
    };

    loadAssignments();
  }, []);

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Upcoming Assignments</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Upcoming Assignments</h3>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <p className="text-red-600 text-xs mt-1">Using mock data instead</p>
        </div>
      )}
      
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="space-y-3">
            {mockAssignments.map((assignment) => {
              const daysUntil = getDaysUntilDue(assignment.dueDate);
              return (
                <div key={assignment.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-gray-300">
                  <div className="font-medium text-gray-800">{assignment.title}</div>
                  <div className="text-sm text-gray-600">{assignment.course} • Mock data</div>
                  <div className="text-xs text-blue-600">Due in {daysUntil} days</div>
                </div>
              );
            })}
          </div>
        ) : (
          assignments.map((assignment) => {
            const daysUntil = getDaysUntilDue(assignment.due_at!);
            const isUrgent = daysUntil <= 2;
            
            return (
              <div key={assignment.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors border-l-4 border-green-500">
                <div className="font-medium text-gray-800">{assignment.name}</div>
                <div className="text-sm text-gray-600 mt-1">{assignment.course_name} • Canvas</div>
                <div className={`text-xs mt-1 ${isUrgent ? 'text-red-600 font-medium' : 'text-blue-600'}`}>
                  Due {formatDueDate(assignment.due_at!)} ({daysUntil} day{daysUntil !== 1 ? 's' : ''})
                  {assignment.points_possible && ` • ${assignment.points_possible} points`}
                </div>
              </div>
            );
          })
        )}
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