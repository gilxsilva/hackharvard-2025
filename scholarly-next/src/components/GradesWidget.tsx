import {useState, useEffect } from 'react'
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import { Calendar, BookOpen, Award, BarChart3, MessageCircle, Send } from 'lucide-react';

const mockGrades = [
  { id: 1, course: 'CS 201', assignment: 'Midterm Exam', grade: 'A-', points: 3.7 },
  { id: 2, course: 'MATH 101', assignment: 'Quiz 3', grade: 'B+', points: 3.3 },
  { id: 3, course: 'PHYS 201', assignment: 'Lab Report 2', grade: 'A', points: 4.0 }
];


export default function GradesWidget() {
  const [courseGrades, setCourseGrades] = useState<CanvasCourseGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('� GradesWidget: Starting to load Canvas course grades...');
        
        const grades = await fetchOverallCourseGrades();
        setCourseGrades(grades);
        
        console.log('✅ GradesWidget: Successfully loaded course grades:', grades.length);
      } catch (err) {
        console.error('❌ GradesWidget: Failed to load Canvas course grades:', err);
        setError('Failed to load course grades');
        // Fallback to empty data
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

  const displayGrades = courseGrades.length > 0 ? courseGrades : mockGrades.map(mg => ({
    course_id: 0,
    course_name: mg.course,
    course_code: mg.course,
    current_grade: mg.grade,
    current_score: mg.points * 25, // Convert 4.0 scale to percentage
    final_grade: null,
    final_score: null,
    unposted_current_score: null,
    unposted_final_score: null
  }));

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
            {error} - Showing sample data
          </p>
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {courseGrades.length > 0 ? 'Average Grade' : 'Sample GPA'}
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
        {displayGrades.slice(0, 8).map((grade: any, index: number) => (
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
        ))}
      </div>
      
      {courseGrades.length > 8 && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Showing 8 of {courseGrades.length} courses
        </div>
      )}
    </div>
  );
}
