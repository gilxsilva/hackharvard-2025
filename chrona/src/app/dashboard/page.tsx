'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, BookOpen, Calendar, BarChart3 } from 'lucide-react';

import ChatBar from '@/components/ChatBar';
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import { CourseWorkloadWidget } from '@/components/dashboard/CourseWorkloadWidget';
import { GradeAnalyticsWidget } from '@/components/dashboard/GradeAnalyticsWidget';
import { MissingAssignmentsWidget } from '@/components/dashboard/MissingAssignmentsWidget';
import { RecentActivityWidget } from '@/components/dashboard/RecentActivityWidget';

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
        
        const canvasCourses = await fetchCanvasCourses();
        
        console.log('📚 CoursesWidget: Raw courses response:', canvasCourses);
        console.log('📚 CoursesWidget: Number of courses received:', canvasCourses.length);
        console.log('📚 CoursesWidget: Course data types and structure:');
        
        setCourses(canvasCourses);
        
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
        const canvasAssignments = await fetchUpcomingAssignments();
        
        const displayAssignments = canvasAssignments.slice(0, 5);
        setAssignments(displayAssignments);
        
      } catch (error) {
        console.error('AssignmentsWidget: Failed to load Canvas assignments:', error);
        console.error('❌ AssignmentsWidget: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        setError('Failed to load assignments from Canvas');
        setAssignments([]);
      } finally {
        setLoading(false);
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
  const [courseGrades, setCourseGrades] = useState<CanvasCourseGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/canvas/course-grades');
        if (!response.ok) {
          throw new Error('Failed to fetch course grades');
        }
        
        const grades = await response.json();
        setCourseGrades(grades);
        
      } catch (err) {
        setError('Failed to load course grades');
        console.error('Course grades fetch error:', err);
        setCourseGrades([]);
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, []);

  const calculateGPA = (grades: CanvasCourseGrade[]) => {
    if (grades.length === 0) return 'N/A';
    
    const validGrades = grades.filter(g => {
      const score = g.current_score || g.final_score;
      return score !== null && score >= 0;
    });
    
    if (validGrades.length === 0) return 'N/A';
    
    const totalScore = validGrades.reduce((sum, grade) => {
      const score = grade.current_score || grade.final_score || 0;
      return sum + score;
    }, 0);
    
    return `${(totalScore / validGrades.length).toFixed(1)}%`;
  };

  const getGradeColor = (grade: CanvasCourseGrade) => {
    const score = grade.current_score || grade.final_score;
    
    if (score === null || score === undefined) {
      return 'text-gray-600';
    }
    
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatGradeDisplay = (grade: CanvasCourseGrade) => {
    const letterGrade = grade.current_grade || grade.final_grade;
    const score = grade.current_score || grade.final_score;
    
    if (letterGrade && score !== null) {
      return `${letterGrade} (${score.toFixed(1)}%)`;
    } else if (letterGrade) {
      return letterGrade;
    } else if (score !== null) {
      return `${score.toFixed(1)}%`;
    }
    return 'No Grade';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Course Grades</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-md mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayGrades = courseGrades;
  const gpaScore = courseGrades.length > 0 ? calculateGPA(courseGrades) : 'N/A';
  


  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Award className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Course Grades</h3>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            {error}
          </p>
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Average GPA
          </span>
          <span className="font-bold text-lg text-gray-800">{gpaScore}</span>
        </div>
        {courseGrades.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Based on {courseGrades.length} courses
          </div>
        )}
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {displayGrades.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No course grades available</p>
          </div>
        ) : (
          displayGrades.slice(0, 8).map((grade: any, index: number) => (
            <div key={grade.course_id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {grade.course_code}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {grade.course_name}
                </div>
              </div>
              <div className={`font-bold ${getGradeColor(grade)}`}>
                {formatGradeDisplay(grade)}
              </div>
            </div>
          ))
        )}
      </div>
      
      {courseGrades.length > 8 && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Showing 8 of {courseGrades.length} courses
        </div>
      )}
    </div>
  );
}

function StatsWidget() {
  const [stats, setStats] = useState([
    { label: 'Classes This Week', value: '0', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Study Hours', value: '0', icon: Calendar, color: 'text-green-600' },
    { label: 'Assignments Due', value: '0', icon: Award, color: 'text-orange-600' },
    { label: 'Progress', value: '0%', icon: BarChart3, color: 'text-purple-600' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Fetch data from multiple APIs
        const [coursesResponse, assignmentsResponse, courseGradesResponse] = await Promise.all([
          fetch('/api/canvas/courses'),
          fetch('/api/canvas/assignments/upcoming'),
          fetch('/api/canvas/course-grades')
        ]);

        const courses = coursesResponse.ok ? await coursesResponse.json() : [];
        const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : [];
        const courseGrades = courseGradesResponse.ok ? await courseGradesResponse.json() : [];

        // Calculate assignments due this week
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const assignmentsDueThisWeek = assignments.filter((assignment: any) => {
          if (!assignment.due_at) return false;
          const dueDate = new Date(assignment.due_at);
          return dueDate >= now && dueDate <= weekFromNow;
        }).length;

        // Estimate study hours based on assignments and courses (rough calculation)
        const totalAssignments = assignments.length;
        const estimatedStudyHours = Math.min(Math.max(totalAssignments * 2 + courses.length * 3, 5), 40);

        // Calculate progress based on completed vs total assignments
        const totalPoints = assignments.reduce((sum: number, a: any) => sum + (a.points_possible || 0), 0);
        const completedPoints = assignments
          .filter((a: any) => a.submission && a.submission.score !== null)
          .reduce((sum: number, a: any) => sum + (a.submission.score || 0), 0);
        const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

        setStats([
          { label: 'Classes This Week', value: courses.length.toString(), icon: BookOpen, color: 'text-blue-600' },
          { label: 'Study Hours', value: estimatedStudyHours.toString(), icon: Calendar, color: 'text-green-600' },
          { label: 'Assignments Due', value: assignmentsDueThisWeek.toString(), icon: Award, color: 'text-orange-600' },
          { label: 'Progress', value: `${progress}%`, icon: BarChart3, color: 'text-purple-600' }
        ]);
        
      } catch (error) {
        console.error('Stats fetch error:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Weekly Overview</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-md animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-1"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
      {/* Legacy Header - will be replaced with space theme soon */}
      <header className="bg-zinc-900/95 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 z-50 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Chrona</h1>
              <span className="text-gray-400">Academic Dashboard</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-purple-400 font-medium"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link
                href="/calendar"
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Smart Calendar</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Demo Student</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Critical Alerts Row */}
            <div className="xl:col-span-4">
              <MissingAssignmentsWidget />
            </div>
            
            {/* Analytics Row */}
            <div className="md:col-span-2 xl:col-span-2">
              <GradeAnalyticsWidget />
            </div>
            <div className="md:col-span-2 xl:col-span-2">
              <CourseWorkloadWidget />
            </div>
            
            {/* Activity Row */}
            <div className="md:col-span-2 xl:col-span-4">
              <RecentActivityWidget />
            </div>
            
            {/* Original Widgets Row */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <CoursesWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <AssignmentsWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <GradesWidget />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <StatsWidget />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}