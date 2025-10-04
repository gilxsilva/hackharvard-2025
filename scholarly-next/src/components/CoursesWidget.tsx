import {useState, useEffect } from 'react'
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import { Calendar, BookOpen, Award, BarChart3, MessageCircle, Send } from 'lucide-react';

export default function CoursesWidget() {
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