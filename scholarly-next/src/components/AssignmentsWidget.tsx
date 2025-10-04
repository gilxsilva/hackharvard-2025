import {useState, useEffect } from 'react'
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import { Calendar, BookOpen, Award, BarChart3, MessageCircle, Send } from 'lucide-react';


const mockAssignments = [
  { id: 1, title: 'Data Structures Assignment', course: 'CS 201', dueDate: '2025-01-20', priority: 'high' },
  { id: 2, title: 'Calculus Problem Set', course: 'MATH 101', dueDate: '2025-01-25', priority: 'medium' },
  { id: 3, title: 'Physics Lab Report', course: 'PHYS 201', dueDate: '2025-01-30', priority: 'medium' }
];


export default function AssignmentsWidget() {
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
