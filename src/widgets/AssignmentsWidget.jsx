import { FileText, Clock, AlertCircle } from 'lucide-react';
import { mockAssignments } from '../data/mockData';

export default function AssignmentsWidget() {
  const upcomingAssignments = mockAssignments
    .filter(assignment => new Date(assignment.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const getDaysUntilDue = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPriorityColor = (days) => {
    if (days <= 1) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Upcoming Assignments</h3>
      </div>

      {upcomingAssignments.length === 0 ? (
        <div className="text-gray-500">No upcoming assignments</div>
      ) : (
        <div className="space-y-3">
          {upcomingAssignments.map((assignment) => {
            const daysUntil = getDaysUntilDue(assignment.dueDate);
            return (
              <div key={assignment.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{assignment.title}</div>
                    <div className="text-sm text-gray-600">{assignment.course}</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {daysUntil <= 1 && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <div className={`text-xs mt-1 ${getPriorityColor(daysUntil)}`}>
                  Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

AssignmentsWidget.id = 'assignments';