'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle, Clock, Award, FileText, AlertCircle } from 'lucide-react';

interface RecentGrade {
    assignment_name: string;
    course_code: string;
    course_name: string;
    score: number | null;
    points_possible: number;
    graded_at: string;
    grade: string | null;
    late: boolean;
    missing: boolean;
}

interface RecentActivity {
    id: string;
    type: 'grade' | 'submission' | 'missing';
    title: string;
    subtitle: string;
    timestamp: string;
    status: 'positive' | 'neutral' | 'negative';
    score?: string;
    icon: any;
}

export function RecentActivityWidget({ className = '' }: { className?: string }) {
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
        try {
            setLoading(true);
            
            // Fetch recent grades and missing assignments
            const [gradesResponse, missingResponse] = await Promise.all([
                fetch('/api/canvas/grades'),
                fetch('/api/canvas/missing-assignments')
            ]);

            const activities: RecentActivity[] = [];

            // Process recent grades
            if (gradesResponse.ok) {
                const grades = await gradesResponse.json();
                
                // Get recent grades (last 2 weeks)
                const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                const recentGrades = grades
                    .filter((grade: any) => {
                        const gradedAt = grade.submission.graded_at;
                        return gradedAt && new Date(gradedAt) > twoWeeksAgo;
                    })
                    .sort((a: any, b: any) => 
                        new Date(b.submission.graded_at).getTime() - new Date(a.submission.graded_at).getTime()
                    )
                    .slice(0, 8);

                recentGrades.forEach((grade: any) => {
                    const score = grade.submission.score;
                    const possible = grade.assignment.points_possible;
                    const percentage = possible > 0 ? (score / possible) * 100 : 0;
                    
                    let status: 'positive' | 'neutral' | 'negative' = 'neutral';
                    if (percentage >= 90) status = 'positive';
                    else if (percentage < 70) status = 'negative';

                    activities.push({
                        id: `grade-${grade.assignment.id}`,
                        type: 'grade',
                        title: grade.assignment.name,
                        subtitle: grade.course_code,
                        timestamp: grade.submission.graded_at,
                        status,
                        score: score !== null ? `${score}/${possible}` : 'N/A',
                        icon: Award
                    });
                });
            }

            // Process missing assignments
            if (missingResponse.ok) {
                const missing = await missingResponse.json();
                
                missing.slice(0, 5).forEach((assignment: any) => {
                    activities.push({
                        id: `missing-${assignment.id}`,
                        type: 'missing',
                        title: assignment.name,
                        subtitle: assignment.course_code,
                        timestamp: assignment.due_at || new Date().toISOString(),
                        status: 'negative',
                        icon: AlertCircle
                    });
                });
            }

            // Sort all activities by timestamp
            activities.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            setActivities(activities.slice(0, 10));
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recent activity');
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffDays > 7) {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (diffDays > 0) {
            return `${diffDays}d ago`;
        } else if (diffHours > 0) {
            return `${diffHours}h ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m ago`;
        } else {
            return 'Just now';
        }
    };

    const getActivityColors = (status: RecentActivity['status'], type: RecentActivity['type']) => {
        if (type === 'missing') {
            return {
                border: 'border-red-500',
                bg: 'bg-red-50',
                text: 'text-red-700',
                icon: 'text-red-500'
            };
        }

        switch (status) {
            case 'positive':
                return {
                    border: 'border-green-500',
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    icon: 'text-green-500'
                };
            case 'negative':
                return {
                    border: 'border-red-500',
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    icon: 'text-red-500'
                };
            default:
                return {
                    border: 'border-blue-500',
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    icon: 'text-blue-500'
                };
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-96 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-96 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="flex items-center justify-center h-full text-red-500">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-96 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-2 overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
                {activities.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No recent activity</p>
                        </div>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const colors = getActivityColors(activity.status, activity.type);
                        const IconComponent = activity.icon;
                        
                        return (
                            <div 
                                key={activity.id} 
                                className={`p-3 border-l-4 rounded-r-lg ${colors.border} ${colors.bg}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <IconComponent className={`w-4 h-4 mt-0.5 ${colors.icon} flex-shrink-0`} />
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold ${colors.text} truncate`}>
                                                {activity.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 truncate">
                                                {activity.subtitle}
                                            </p>
                                            {activity.score && (
                                                <p className="text-xs font-medium text-gray-700 mt-1">
                                                    Score: {activity.score}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                        {formatTimestamp(activity.timestamp)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}