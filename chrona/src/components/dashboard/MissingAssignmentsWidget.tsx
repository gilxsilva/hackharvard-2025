'use client';

import { useState, useEffect } from 'react';

interface MissingAssignment {
    id: number;
    name: string;
    description?: string;
    due_at: string | null;
    points_possible: number;
    course_id: number;
    html_url: string;
    submission_types: string[];
    course_name: string;
    course_code: string;
    urgency: 'overdue' | 'urgent' | 'normal' | 'no_due_date';
    days_until_due: number | null;
}

export function MissingAssignmentsWidget({ className = '' }: { className?: string }) {
    const [assignments, setAssignments] = useState<MissingAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMissingAssignments();
    }, []);

    const fetchMissingAssignments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/canvas/missing-assignments');
            
            if (!response.ok) {
                throw new Error('Failed to fetch missing assignments');
            }
            
            const data = await response.json();
            setAssignments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load missing assignments');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: MissingAssignment['urgency']) => {
        switch (urgency) {
            case 'overdue': return 'border-red-500 bg-red-500/10 text-red-300';
            case 'urgent': return 'border-orange-500 bg-orange-500/10 text-orange-300';
            case 'normal': return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
            case 'no_due_date': return 'border-gray-500 bg-gray-500/10 text-gray-300';
        }
    };

    const getUrgencyBadge = (urgency: MissingAssignment['urgency'], daysUntilDue: number | null) => {
        switch (urgency) {
            case 'overdue':
                return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full font-medium">Overdue</span>;
            case 'urgent':
                return <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full font-medium">
                    {daysUntilDue === 0 ? 'Due Today' : `${daysUntilDue} days left`}
                </span>;
            case 'normal':
                return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium">
                    {daysUntilDue} days left
                </span>;
            case 'no_due_date':
                return <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full font-medium">No due date</span>;
        }
    };

    const formatDueDate = (dateString: string | null) => {
        if (!dateString) return 'No due date';
        
        const date = new Date(dateString);
        const today = new Date();
        
        // Reset time to compare only dates
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return 'Due tomorrow';
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays <= 7) return `Due in ${diffDays} days`;
        
        return date.toLocaleDateString();
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

    const overdueCount = assignments.filter(a => a.urgency === 'overdue').length;
    const urgentCount = assignments.filter(a => a.urgency === 'urgent').length;

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {overdueCount > 0 && (
                        <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full">
                            {overdueCount} overdue
                        </span>
                    )}
                    {urgentCount > 0 && (
                        <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded-full">
                            {urgentCount} urgent
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
                {assignments.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-green-400">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <p className="font-medium">All caught up!</p>
                            <p className="text-sm text-gray-400">No missing assignments</p>
                        </div>
                    </div>
                ) : (
                    assignments.slice(0, 10).map((assignment) => (
                        <div
                            key={assignment.id}
                            className={`p-3 border-l-4 rounded-r-lg cursor-pointer hover:bg-white/10 transition-all ${getUrgencyColor(assignment.urgency)}`}
                            onClick={() => window.open(assignment.html_url, '_blank')}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-white">
                                            {assignment.course_code}
                                        </span>
                                        {getUrgencyBadge(assignment.urgency, assignment.days_until_due)}
                                    </div>

                                    <h4 className="text-sm font-semibold truncate mb-1 text-white">
                                        {assignment.name}
                                    </h4>

                                    <div className="flex items-center justify-between text-xs text-gray-300">
                                        <span>
                                            {assignment.points_possible || 0} points
                                        </span>
                                        <span>
                                            {formatDueDate(assignment.due_at)}
                                        </span>
                                    </div>

                                    {assignment.submission_types.length > 0 && (
                                        <div className="mt-1">
                                            <span className="text-xs text-gray-400">
                                                {assignment.submission_types.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {assignments.length > 10 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                        className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                        onClick={() => {/* Navigate to full missing assignments view */}}
                    >
                        View all {assignments.length} missing assignments
                    </button>
                </div>
            )}
        </div>
    );
}