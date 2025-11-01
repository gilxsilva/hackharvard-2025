'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Award, AlertCircle } from 'lucide-react';

interface RecentActivity {
    id: string;
    type: 'grade' | 'submission' | 'missing';
    title: string;
    subtitle: string;
    timestamp: string;
    status: 'positive' | 'neutral' | 'negative';
    score?: string;
    icon: React.ComponentType<{ className?: string }>;
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
                    .filter((grade: { submission: { graded_at: string | null } }) => {
                        const gradedAt = grade.submission.graded_at;
                        return gradedAt && new Date(gradedAt) > twoWeeksAgo;
                    })
                    .sort((a: { submission: { graded_at: string } }, b: { submission: { graded_at: string } }) => 
                        new Date(b.submission.graded_at).getTime() - new Date(a.submission.graded_at).getTime()
                    )
                    .slice(0, 8);

                recentGrades.forEach((grade: { 
                    submission: { score: number; graded_at: string }; 
                    assignment: { points_possible: number; name: string; id: number }; 
                    course_name: string; 
                    course_code: string;
                }) => {
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
                
                missing.slice(0, 5).forEach((assignment: { id: number; name: string; course_code: string; due_at: string | null }) => {
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
                bg: 'bg-red-500/10',
                text: 'text-red-300',
                icon: 'text-red-400'
            };
        }

        switch (status) {
            case 'positive':
                return {
                    border: 'border-green-500',
                    bg: 'bg-green-500/10',
                    text: 'text-green-300',
                    icon: 'text-green-400'
                };
            case 'negative':
                return {
                    border: 'border-red-500',
                    bg: 'bg-red-500/10',
                    text: 'text-red-300',
                    icon: 'text-red-400'
                };
            default:
                return {
                    border: 'border-blue-500',
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-300',
                    icon: 'text-blue-400'
                };
        }
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
                <Activity className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                            <p className="text-sm">No recent activity</p>
                        </div>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const colors = getActivityColors(activity.status, activity.type);
                        const IconComponent = activity.icon;

                        return (
                            <div
                                key={activity.id}
                                className={`p-3 border-l-4 rounded-r-lg hover:bg-white/10 transition-colors ${colors.border} ${colors.bg}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <IconComponent className={`w-4 h-4 mt-0.5 ${colors.icon} flex-shrink-0`} />

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold ${colors.text} truncate`}>
                                                {activity.title}
                                            </h4>
                                            <p className="text-xs text-gray-400 truncate">
                                                {activity.subtitle}
                                            </p>
                                            {activity.score && (
                                                <p className="text-xs font-medium text-white mt-1">
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