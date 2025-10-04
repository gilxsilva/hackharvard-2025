import { TrendingUp, Award } from 'lucide-react';
import { mockGrades } from '../data/mockData';

export default function GradesWidget() {
  const calculateGPA = (grades) => {
    const total = grades.reduce((sum, grade) => sum + grade.points, 0);
    return (total / grades.length).toFixed(2);
  };

  const recentGrades = mockGrades.slice(0, 4);
  const gpa = calculateGPA(mockGrades);

  const getGradeColor = (points) => {
    if (points >= 3.7) return 'text-green-600';
    if (points >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Award className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Academic Performance</h3>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current GPA</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-bold text-lg text-gray-800">{gpa}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">Recent Grades</div>
        {recentGrades.map((grade) => (
          <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div>
              <div className="text-sm font-medium text-gray-800">{grade.course}</div>
              <div className="text-xs text-gray-600">{grade.assignment}</div>
            </div>
            <div className={`font-bold ${getGradeColor(grade.points)}`}>
              {grade.grade}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

GradesWidget.id = 'grades';