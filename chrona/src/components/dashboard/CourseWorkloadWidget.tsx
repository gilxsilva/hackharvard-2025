'use client';

import { useState, useEffect } from 'react';

interface Assignment {
    id: number;
    name: string;
    due_at: string | null;
    points_possible: number;
    course_id: number;
    html_url: string;
    course_name: string;
    course_code: string;
    urgency?: 'overdue' | 'urgent' | 'normal' | 'no_due_date';
    days_until_due?: number | null;
}

interface CourseWorkload {
    course_id: number;
    course_name: string;
    course_code: string;
    assignment_count: number;
    total_points: number;
    upcoming_assignments: Assignment[];
    urgency_breakdown: {
        overdue: number;
        urgent: number;
        normal: number;
        no_due_date: number;
    };
}

export function CourseWorkloadWidget({ className = '' }: { className?: string }) {
    const [workload, setWorkload] = useState<CourseWorkload[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkload();
    }, []);

    const fetchWorkload = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/canvas/assignments/upcoming');
            
            if (!response.ok) {
                throw new Error('Failed to fetch workload data');
            }
            
            const assignments: Assignment[] = await response.json();
            
            // Group assignments by course and calculate workload metrics
            const courseMap = new Map<number, CourseWorkload>();
            
            assignments.forEach(assignment => {
                if (!courseMap.has(assignment.course_id)) {
                    courseMap.set(assignment.course_id, {
                        course_id: assignment.course_id,
                        course_name: assignment.course_name,
                        course_code: assignment.course_code,
                        assignment_count: 0,
                        total_points: 0,
                        upcoming_assignments: [],
                        urgency_breakdown: {
                            overdue: 0,
                            urgent: 0,
                            normal: 0,
                            no_due_date: 0
                        }
                    });
                }
                
                const courseWorkload = courseMap.get(assignment.course_id)!;
                courseWorkload.assignment_count++;
                courseWorkload.total_points += assignment.points_possible || 0;
                courseWorkload.upcoming_assignments.push(assignment);
                
                // Calculate urgency
                let urgency: Assignment['urgency'] = 'no_due_date';
                if (assignment.due_at) {
                    const dueDate = new Date(assignment.due_at);
                    const now = new Date();
                    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    
                    if (daysUntil < 0) urgency = 'overdue';
                    else if (daysUntil <= 3) urgency = 'urgent';
                    else urgency = 'normal';
                }
                
                courseWorkload.urgency_breakdown[urgency]++;
            });
            
            // Convert to array and sort by total workload (points + urgency)
            const workloadArray = Array.from(courseMap.values()).sort((a, b) => {
                const scoreA = a.total_points + (a.urgency_breakdown.overdue * 100) + (a.urgency_breakdown.urgent * 50);
                const scoreB = b.total_points + (b.urgency_breakdown.overdue * 100) + (b.urgency_breakdown.urgent * 50);
                return scoreB - scoreA;
            });
            
            setWorkload(workloadArray);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workload data');
        } finally {
            setLoading(false);
        }
    };

    const getWorkloadColor = (urgencyBreakdown: CourseWorkload['urgency_breakdown']) => {
        if (urgencyBreakdown.overdue > 0) return 'border-red-500 bg-red-500/10';
        if (urgencyBreakdown.urgent > 0) return 'border-orange-500 bg-orange-500/10';
        return 'border-green-500 bg-green-500/10';
    };

    if (loading) {
        return (
            <div className={`space-y-3 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`space-y-3 ${className}`}>
                <div className="flex items-center justify-center h-64 text-red-400">
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                    {workload.reduce((total, course) => total + course.assignment_count, 0)} assignments
                </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
                {workload.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        <p className="text-sm">No upcoming assignments</p>
                    </div>
                ) : (
                    workload.map((course) => (
                        <div
                            key={course.course_id}
                            className={`p-3 border-l-4 rounded-r-lg hover:bg-white/10 transition-colors ${getWorkloadColor(course.urgency_breakdown)}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-semibold text-white truncate">
                                    {course.course_code}
                                </h4>
                                <span className="text-xs text-gray-300">
                                    {course.assignment_count} assignments
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-gray-400 truncate flex-1">
                                    {course.total_points} total points
                                </span>

                                <div className="flex gap-1 ml-2">
                                    {course.urgency_breakdown.overdue > 0 && (
                                        <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-xs">
                                            {course.urgency_breakdown.overdue} overdue
                                        </span>
                                    )}
                                    {course.urgency_breakdown.urgent > 0 && (
                                        <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-xs">
                                            {course.urgency_breakdown.urgent} urgent
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Show only the next assignment to save space */}
                            {course.upcoming_assignments.length > 0 && (
                                <div className="text-xs text-gray-300 flex justify-between">
                                    <span className="truncate flex-1">{course.upcoming_assignments[0].name}</span>
                                    <span className="ml-2 text-xs text-gray-400">
                                        {course.upcoming_assignments[0].due_at ?
                                            new Date(course.upcoming_assignments[0].due_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) :
                                            'No due date'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}