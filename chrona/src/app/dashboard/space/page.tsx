'use client';

import { Award, BookOpen, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import DashboardCanvas from '@/components/dashboard/DashboardCanvas';
import Widget from '@/components/dashboard/Widget';
import LaunchSequence from '@/components/intro/LaunchSequence';
import { ZoomProvider, useZoomContext } from '@/contexts/ZoomContext';
import { NavigationProvider } from '@/contexts/NavigationContext';

// Import existing widget components
import { useState, useEffect, useCallback } from 'react';
import { fetchUpcomingAssignments, fetchCanvasCourses, fetchOverallCourseGrades, type CanvasAssignment, type CanvasCourse, type CanvasCourseGrade } from '@/lib/canvasApi';
import { useGridSnap } from '@/hooks/useGridSnap';
import { applyLayout, type LayoutMode, type WidgetPosition } from '@/utils/layoutAlgorithms';
import GridOverlay from '@/components/grid/GridOverlay';
import GridController from '@/components/grid/GridController';
import type { Position } from '@/hooks/useDragAndDrop';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import GoogleCalendarWidget from '@/components/dashboard/GoogleCalendarWidget';
import { MissingAssignmentsWidget } from '@/components/dashboard/MissingAssignmentsWidget';
import { GradeAnalyticsWidget } from '@/components/dashboard/GradeAnalyticsWidget';
import { CourseWorkloadWidget } from '@/components/dashboard/CourseWorkloadWidget';
import { RecentActivityWidget } from '@/components/dashboard/RecentActivityWidget';

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
  const [assignments, setAssignments] = useState<(CanvasAssignment & { course_name: string })[]>([]);
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
            <div className="text-sm text-gray-400 mt-1">{assignment.course_name}</div>
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
      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
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

// Main Dashboard Component
function SpaceDashboardContent() {
  const { toggleZoom, isFocused } = useZoomContext();
  const { config, snapToGrid, toggleGridSnap, toggleGuides, isEnabled, showGuides } = useGridSnap(false);
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>('orbital');
  const [widgetPositions, setWidgetPositions] = useState<Record<string, Position>>({});

  const widgetIds = ['courses', 'assignments', 'grades', 'stats', 'calendar', 'google-calendar', 'missing', 'analytics', 'workload', 'activity'];

  // Calculate orbital positions (responsive)
  const getPosition = (index: number, total: number = 10) => {
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 800;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
    const radius = Math.min(centerX, centerY) * 0.5;
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;

    return {
      x: centerX + radius * Math.cos(angle) - 190,
      y: centerY + radius * Math.sin(angle) - 210
    };
  };

  // Initialize widget positions on client only
  useEffect(() => {
    const initialPositions: Record<string, Position> = {};
    widgetIds.forEach((id, index) => {
      initialPositions[id] = getPosition(index);
    });
    setWidgetPositions(initialPositions);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-arrange function
  const handleAutoArrange = () => {
    if (typeof window === 'undefined') return;

    const layoutParams = {
      centerX: window.innerWidth / 2,
      centerY: window.innerHeight / 2,
      widgetWidth: 380,
      widgetHeight: 420
    };

    const newPositions = applyLayout(widgetIds, currentLayout, layoutParams);
    const positionsMap: Record<string, Position> = {};
    newPositions.forEach(pos => {
      positionsMap[pos.id] = { x: pos.x, y: pos.y };
    });
    setWidgetPositions(positionsMap);
  };

  // Handle position change for individual widgets
  const handlePositionChange = useCallback((id: string, position: Position) => {
    setWidgetPositions(prev => {
      // Only update if position actually changed
      if (prev[id]?.x === position.x && prev[id]?.y === position.y) {
        return prev;
      }
      return { ...prev, [id]: position };
    });
  }, []);

  // Keyboard shortcut for toggling grid snap
  useKeyboardShortcuts([
    {
      key: 'g',
      action: toggleGridSnap,
      description: 'Toggle grid snap mode'
    }
  ]);

  return (
    <>
      {/* Grid Overlay */}
      <GridOverlay cellSize={config.cellSize} isVisible={showGuides} />

      {/* Grid Controller */}
      <GridController
        isGridEnabled={isEnabled}
        showGuides={showGuides}
        currentLayout={currentLayout}
        onToggleGrid={toggleGridSnap}
        onToggleGuides={toggleGuides}
        onChangeLayout={setCurrentLayout}
        onAutoArrange={handleAutoArrange}
      />

      {widgetPositions['courses'] && (
        <Widget
          id="courses"
          title="My Courses"
          icon={<BookOpen className="w-5 h-5" />}
          initialPosition={widgetPositions['courses']}
          glowColor="green"
          isZoomed={isFocused('courses')}
          onDoubleClick={() => toggleZoom('courses')}
          onPositionChange={(pos) => handlePositionChange('courses', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <CoursesWidgetContent />
        </Widget>
      )}

      {widgetPositions['assignments'] && (
        <Widget
          id="assignments"
          title="Upcoming Assignments"
          icon={<CalendarIcon className="w-5 h-5" />}
          initialPosition={widgetPositions['assignments']}
          glowColor="blue"
          isZoomed={isFocused('assignments')}
          onDoubleClick={() => toggleZoom('assignments')}
          onPositionChange={(pos) => handlePositionChange('assignments', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <AssignmentsWidgetContent />
        </Widget>
      )}

      {widgetPositions['grades'] && (
        <Widget
          id="grades"
          title="Course Grades"
          icon={<Award className="w-5 h-5" />}
          initialPosition={widgetPositions['grades']}
          glowColor="purple"
          isZoomed={isFocused('grades')}
          onDoubleClick={() => toggleZoom('grades')}
          onPositionChange={(pos) => handlePositionChange('grades', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <GradesWidgetContent />
        </Widget>
      )}

      {widgetPositions['stats'] && (
        <Widget
          id="stats"
          title="Weekly Overview"
          icon={<BarChart3 className="w-5 h-5" />}
          initialPosition={widgetPositions['stats']}
          glowColor="purple"
          isZoomed={isFocused('stats')}
          onDoubleClick={() => toggleZoom('stats')}
          onPositionChange={(pos) => handlePositionChange('stats', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <StatsWidgetContent />
        </Widget>
      )}

      {widgetPositions['calendar'] && (
        <Widget
          id="calendar"
          title="Smart Calendar"
          icon={<CalendarIcon className="w-5 h-5" />}
          initialPosition={widgetPositions['calendar']}
          glowColor="blue"
          isZoomed={isFocused('calendar')}
          onDoubleClick={() => toggleZoom('calendar')}
          onPositionChange={(pos) => handlePositionChange('calendar', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <CalendarWidget />
        </Widget>
      )}

      {widgetPositions['google-calendar'] && (
        <GoogleCalendarWidget
          id="google-calendar"
          initialPosition={widgetPositions['google-calendar']}
          onPositionChange={(pos) => handlePositionChange('google-calendar', pos)}
        />
      )}

      {widgetPositions['missing'] && (
        <Widget
          id="missing"
          title="Missing Assignments"
          icon={<Award className="w-5 h-5" />}
          initialPosition={widgetPositions['missing']}
          glowColor="red"
          isZoomed={isFocused('missing')}
          onDoubleClick={() => toggleZoom('missing')}
          onPositionChange={(pos) => handlePositionChange('missing', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <MissingAssignmentsWidget />
        </Widget>
      )}

      {widgetPositions['analytics'] && (
        <Widget
          id="analytics"
          title="Grade Analytics"
          icon={<BarChart3 className="w-5 h-5" />}
          initialPosition={widgetPositions['analytics']}
          glowColor="green"
          isZoomed={isFocused('analytics')}
          onDoubleClick={() => toggleZoom('analytics')}
          onPositionChange={(pos) => handlePositionChange('analytics', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <GradeAnalyticsWidget />
        </Widget>
      )}

      {widgetPositions['workload'] && (
        <Widget
          id="workload"
          title="Course Workload"
          icon={<BookOpen className="w-5 h-5" />}
          initialPosition={widgetPositions['workload']}
          glowColor="purple"
          isZoomed={isFocused('workload')}
          onDoubleClick={() => toggleZoom('workload')}
          onPositionChange={(pos) => handlePositionChange('workload', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <CourseWorkloadWidget />
        </Widget>
      )}

      {widgetPositions['activity'] && (
        <Widget
          id="activity"
          title="Recent Activity"
          icon={<BarChart3 className="w-5 h-5" />}
          initialPosition={widgetPositions['activity']}
          glowColor="blue"
          isZoomed={isFocused('activity')}
          onDoubleClick={() => toggleZoom('activity')}
          onPositionChange={(pos) => handlePositionChange('activity', pos)}
          snapFunction={isEnabled ? snapToGrid : undefined}
        >
          <RecentActivityWidget />
        </Widget>
      )}
    </>
  );
}

export default function SpaceDashboardPage() {
  return (
    <LaunchSequence enabled={true}>
      <NavigationProvider>
        <ZoomProvider>
          <DashboardCanvas>
            <SpaceDashboardContent />
          </DashboardCanvas>
        </ZoomProvider>
      </NavigationProvider>
    </LaunchSequence>
  );
}
