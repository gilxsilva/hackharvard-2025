'use client';

import { Award, BookOpen, Calendar as CalendarIcon, BarChart3, Bot } from 'lucide-react';
import SortableWidget from '@/components/dashboard/SortableWidget';
import { SortableDashboard } from '@/contexts/SortableDashboard';
import SpaceBackground from '@/components/dashboard/SpaceBackground';
import CommandBar from '@/components/navigation/CommandBar';

// Import existing widget components
import { useState, useEffect, useCallback } from 'react';
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import GoogleCalendarWidget from '@/components/dashboard/GoogleCalendarWidget';
import { MissingAssignmentsWidget } from '@/components/dashboard/MissingAssignmentsWidget';
import { GradeAnalyticsWidget } from '@/components/dashboard/GradeAnalyticsWidget';
import { CourseWorkloadWidget } from '@/components/dashboard/CourseWorkloadWidget';
import { RecentActivityWidget } from '@/components/dashboard/RecentActivityWidget';
import ChatBar from '@/components/ChatBar';
import WidgetSelector, { DEFAULT_WIDGETS, type WidgetConfig } from '@/components/dashboard/WidgetSelector';

// Mock data
const mockAssignments = [
  { id: 1, title: 'Data Structures Assignment', course: 'CS 201', dueDate: '2025-01-20', priority: 'high' },
  { id: 2, title: 'Calculus Problem Set', course: 'MATH 101', dueDate: '2025-01-25', priority: 'medium' },
  { id: 3, title: 'Physics Lab Report', course: 'PHYS 201', dueDate: '2025-01-30', priority: 'medium' }
];

// Widget Content Components
function CoursesWidgetContent() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const canvasCourses = await fetchCanvasCourses();
        setCourses(canvasCourses);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.length === 0 ? (
        <p className="text-gray-400 text-sm">No courses found</p>
      ) : (
        courses.map((course) => (
          <div key={course.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-l-4 border-green-500/50">
            <div className="font-medium text-white">{course.name}</div>
            <div className="text-sm text-gray-400 mt-1">{course.course_code}</div>
          </div>
        ))
      )}
    </div>
  );
}

function AssignmentsWidgetContent() {
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const canvasAssignments = await fetchUpcomingAssignments();
        setAssignments(canvasAssignments.slice(0, 5));
      } catch (error) {
        console.error('Failed to load assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const getDaysUntilDue = (dueDate: string) => {
    return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const displayAssignments = assignments.length > 0 ? assignments : mockAssignments.map(a => ({
    ...a as any,
    name: a.title,
    due_at: a.dueDate,
    course_name: a.course
  }));

  return (
    <div className="space-y-3">
      {displayAssignments.map((assignment: any, index: number) => {
        const daysUntil = getDaysUntilDue(assignment.due_at || assignment.dueDate);
        const isUrgent = daysUntil <= 2;

        return (
          <div key={assignment.id || index} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border-l-4 border-blue-500/50">
            <div className="font-medium text-white">{assignment.name || assignment.title}</div>
            <div className="text-sm text-gray-400 mt-1">{assignment.course_name || 'Canvas'}</div>
            <div className={`text-xs mt-1 ${isUrgent ? 'text-red-400 font-medium' : 'text-blue-400'}`}>
              Due in {daysUntil} days
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GradesWidgetContent() {
  const [courseGrades, setCourseGrades] = useState<CanvasCourseGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const grades = await fetchOverallCourseGrades();
        setCourseGrades(grades);
      } catch (error) {
        console.error('Failed to load grades:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGrades();
  }, []);

  const calculateAverage = () => {
    if (courseGrades.length === 0) return 'N/A';
    const validGrades = courseGrades.filter(g => g.current_score !== null);
    if (validGrades.length === 0) return 'N/A';
    const avg = validGrades.reduce((sum, g) => sum + (g.current_score || 0), 0) / validGrades.length;
    return `${avg.toFixed(1)}%`;
  };

  const getGradeColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-br from-cosmic-purple-500/10 to-cosmic-blue-500/10 rounded-xl border border-cosmic-purple-500/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Average Grade</span>
          <span className="font-bold text-2xl text-white">{calculateAverage()}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {courseGrades.slice(0, 8).map((grade) => (
          <div key={grade.course_id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{grade.course_code}</div>
              <div className="text-xs text-gray-400 truncate">{grade.course_name}</div>
            </div>
            <div className={`font-bold ${getGradeColor(grade.current_score)}`}>
              {grade.current_grade || grade.current_score?.toFixed(1) + '%' || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsWidgetContent() {
  const stats = [
    { label: 'Classes', value: '12', color: 'text-blue-400' },
    { label: 'Study Hours', value: '24', color: 'text-green-400' },
    { label: 'Due Soon', value: '5', color: 'text-orange-400' },
    { label: 'Progress', value: '85%', color: 'text-purple-400' }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
          <div className={`font-bold text-2xl ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Widget order state
const INITIAL_WIDGET_ORDER = [
  'courses',
  'assignments', 
  'grades',
  'stats',
  'calendar',
  'google-calendar',
  'missing',
  'analytics',
  'workload',
  'activity'
];

// Main Dashboard Component
function SimpleDashboardContent() {
  const [widgetOrder, setWidgetOrder] = useState<string[]>(INITIAL_WIDGET_ORDER);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  // Handle widget reordering
  const handleItemsChange = useCallback((newOrder: string[]) => {
    setWidgetOrder(newOrder);
  }, []);

  // Handle AI chat toggle
  const handleToggleAI = useCallback(() => {
    setShowAIChat(!showAIChat);
  }, [showAIChat]);

  // Handle widget selector toggle
  const handleToggleWidgetSelector = useCallback(() => {
    setShowWidgetSelector(!showWidgetSelector);
  }, [showWidgetSelector]);

  // Handle widget configuration changes
  const handleWidgetConfigChange = useCallback((newConfigs: WidgetConfig[]) => {
    setWidgetConfigs(newConfigs);
    
    // Update widget order to only include enabled widgets
    const enabledWidgetIds = newConfigs.filter(config => config.enabled).map(config => config.id);
    const newOrder = widgetOrder.filter(id => enabledWidgetIds.includes(id));
    
    // Add any newly enabled widgets that aren't in the current order
    const missingWidgets = enabledWidgetIds.filter(id => !newOrder.includes(id));
    setWidgetOrder([...newOrder, ...missingWidgets]);
  }, [widgetOrder]);

  // Get currently enabled widgets
  const enabledWidgets = widgetConfigs.filter(config => config.enabled);
  const visibleWidgetOrder = widgetOrder.filter(id => 
    enabledWidgets.some(config => config.id === id)
  );

  const renderWidget = (id: string) => {
    const widgets = {
      courses: (
        <SortableWidget id="courses" title="My Courses" icon={<BookOpen className="w-5 h-5" />} glowColor="green">
          <CoursesWidgetContent />
        </SortableWidget>
      ),
      assignments: (
        <SortableWidget id="assignments" title="Upcoming Assignments" icon={<CalendarIcon className="w-5 h-5" />} glowColor="blue">
          <AssignmentsWidgetContent />
        </SortableWidget>
      ),
      grades: (
        <SortableWidget id="grades" title="Course Grades" icon={<Award className="w-5 h-5" />} glowColor="purple">
          <GradesWidgetContent />
        </SortableWidget>
      ),
      stats: (
        <SortableWidget id="stats" title="Weekly Overview" icon={<BarChart3 className="w-5 h-5" />} glowColor="purple">
          <StatsWidgetContent />
        </SortableWidget>
      ),
      calendar: (
        <SortableWidget id="calendar" title="Smart Calendar" icon={<CalendarIcon className="w-5 h-5" />} glowColor="blue">
          <CalendarWidget />
        </SortableWidget>
      ),
      'google-calendar': (
        <SortableWidget id="google-calendar" title="Google Calendar" icon={<CalendarIcon className="w-5 h-5" />} glowColor="green">
          <GoogleCalendarWidget id="google-calendar" />
        </SortableWidget>
      ),
      missing: (
        <SortableWidget id="missing" title="Missing Assignments" icon={<Award className="w-5 h-5" />} glowColor="red">
          <MissingAssignmentsWidget />
        </SortableWidget>
      ),
      analytics: (
        <SortableWidget id="analytics" title="Grade Analytics" icon={<BarChart3 className="w-5 h-5" />} glowColor="green">
          <GradeAnalyticsWidget />
        </SortableWidget>
      ),
      workload: (
        <SortableWidget id="workload" title="Course Workload" icon={<BookOpen className="w-5 h-5" />} glowColor="purple">
          <CourseWorkloadWidget />
        </SortableWidget>
      ),
      activity: (
        <SortableWidget id="activity" title="Recent Activity" icon={<BarChart3 className="w-5 h-5" />} glowColor="blue">
          <RecentActivityWidget />
        </SortableWidget>
      )
    };
    return widgets[id as keyof typeof widgets];
  };

  return (
    <div className="min-h-screen w-full bg-space-bg">
      {/* Space Background */}
      <SpaceBackground />

      {/* Navigation Bar */}
      <CommandBar 
        onToggleAI={handleToggleAI} 
        onOpenWidgetManager={handleToggleWidgetSelector}
      />

      {/* Dashboard Grid */}
      <div className="pt-32 px-8 sm:px-12 lg:px-16">
        <div className="max-w-[1200px] mx-auto">
          <SortableDashboard items={visibleWidgetOrder} onItemsChange={handleItemsChange}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {visibleWidgetOrder.map((widgetId) => (
                <div key={widgetId}>
                  {renderWidget(widgetId)}
                </div>
              ))}
            </div>
          </SortableDashboard>
        </div>
      </div>

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">AI Assistant</h3>
                  <p className="text-sm text-gray-400">Ask about your schedule, assignments, and more</p>
                </div>
              </div>
              <button
                onClick={handleToggleAI}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden p-6">
              <ChatBar />
            </div>
          </div>
        </div>
      )}

      {/* Widget Selector Modal */}
      {showWidgetSelector && (
        <WidgetSelector
          widgets={widgetConfigs}
          onWidgetsChange={handleWidgetConfigChange}
          onClose={handleToggleWidgetSelector}
        />
      )}
    </div>
  );
}

export default SimpleDashboardContent;
