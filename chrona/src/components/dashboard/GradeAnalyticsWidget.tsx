'use client';

import { useState, useEffect } from 'react';

interface GradeData {
    assignment: {
        id: number;
        name: string;
        points_possible: number;
        course_id: number;
        html_url: string;
    };
    submission: {
        id: number;
        assignment_id: number;
        grade: string | null;
        score: number | null;
        late?: boolean;
        missing?: boolean;
        submitted_at: string | null;
        graded_at: string | null;
    };
    course_name: string;
    course_code: string;
}

interface CourseGrades {
    course_id: number;
    course_name: string;
    course_code: string;
    current_grade: string | null;
    current_score: number | null;
    final_grade: string | null;
    final_score: number | null;
}

interface GradeAnalytics {
    overall_gpa: number;
    total_courses: number;
    grade_distribution: { [grade: string]: number };
    recent_trend: 'improving' | 'declining' | 'stable';
    average_score: number;
    course_performance: Array<{
        course_code: string;
        average: number;
        trend: 'improving' | 'declining' | 'stable';
        grade_count: number;
    }>;
}

export function GradeAnalyticsWidget({ className = '' }: { className?: string }) {
    const [analytics, setAnalytics] = useState<GradeAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            
            // Fetch both grades and course grades
            const [gradesResponse, courseGradesResponse] = await Promise.all([
                fetch('/api/canvas/grades'),
                fetch('/api/canvas/course-grades')
            ]);
            
            if (!gradesResponse.ok || !courseGradesResponse.ok) {
                throw new Error('Failed to fetch grade data');
            }
            
            const grades: GradeData[] = await gradesResponse.json();
            const courseGrades: CourseGrades[] = await courseGradesResponse.json();
            
            // Calculate analytics
            const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
            const gradeDistribution: { [grade: string]: number } = {};
            let totalGradePoints = 0;
            let totalCourses = 0;
            
            // Calculate GPA from course grades - ensure we have valid data
            if (Array.isArray(courseGrades) && courseGrades.length > 0) {
                courseGrades.forEach(course => {
                    if (course && course.current_grade && typeof course.current_grade === 'string') {
                        const gradeLetter = course.current_grade.charAt(0).toUpperCase();
                        if (gradeLetter in gradePoints) {
                            gradeDistribution[gradeLetter] = (gradeDistribution[gradeLetter] || 0) + 1;
                            totalGradePoints += gradePoints[gradeLetter as keyof typeof gradePoints];
                            totalCourses++;
                        }
                    }
                });
            }
            
            // Calculate average score from individual assignments - ensure we have valid data
            const validScores = Array.isArray(grades) ? grades
                .filter(g => g && g.submission && g.assignment && 
                    g.submission.score !== null && 
                    g.assignment.points_possible > 0 && 
                    typeof g.submission.score === 'number' && 
                    typeof g.assignment.points_possible === 'number')
                .map(g => ({
                    score: g.submission.score!,
                    possible: g.assignment.points_possible
                })) : [];
                
            const averageScore = validScores.length > 0 
                ? validScores.reduce((sum, item) => {
                    const percentage = (item.score / item.possible) * 100;
                    return sum + (isFinite(percentage) ? percentage : 0);
                }, 0) / validScores.length 
                : 0;
            
            // Calculate course performance and trends - ensure we have valid data
            const coursePerformance = Array.isArray(grades) && grades.length > 0 ? Object.values(
                grades.reduce((acc, grade) => {
                    if (!grade || !grade.assignment || !grade.submission) return acc;
                    
                    const courseId = grade.assignment.course_id;
                    if (!acc[courseId]) {
                        acc[courseId] = {
                            course_code: grade.course_code || 'Unknown',
                            scores: [],
                            grade_count: 0
                        };
                    }
                    
                    if (grade.submission.score !== null && typeof grade.submission.score === 'number' && 
                        grade.assignment.points_possible > 0) {
                        const percentage = (grade.submission.score / grade.assignment.points_possible) * 100;
                        if (isFinite(percentage)) {
                            acc[courseId].scores.push({
                                score: percentage,
                                date: grade.submission.graded_at || grade.submission.submitted_at
                            });
                            acc[courseId].grade_count++;
                        }
                    }
                    
                    return acc;
                }, {} as Record<number, any>)
            ).map(course => {
                const scores = course.scores
                    .filter((s: any) => s.date)
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                const average = scores.length > 0 
                    ? Number((scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length).toFixed(1))
                    : 0;
                
                // Calculate trend
                let trend: 'improving' | 'declining' | 'stable' = 'stable';
                if (scores.length >= 3) {
                    const recent = scores.slice(-3).map((s: any) => s.score);
                    const older = scores.slice(-6, -3).map((s: any) => s.score);
                    
                    if (older.length > 0) {
                        const recentAvg = recent.reduce((sum: number, score: number) => sum + score, 0) / recent.length;
                        const olderAvg = older.reduce((sum: number, score: number) => sum + score, 0) / older.length;
                        
                        if (recentAvg > olderAvg + 2) trend = 'improving';
                        else if (recentAvg < olderAvg - 2) trend = 'declining';
                    }
                }
                
                return {
                    course_code: course.course_code,
                    average,
                    trend,
                    grade_count: course.grade_count
                };
            }).sort((a, b) => b.average - a.average) : [];
            
            // Calculate recent trend - ensure we have valid data
            const recentGrades = Array.isArray(grades) ? grades
                .filter(g => g && g.submission && g.submission.graded_at)
                .sort((a, b) => new Date(b.submission.graded_at!).getTime() - new Date(a.submission.graded_at!).getTime())
                .slice(0, 10)
                .filter(g => g.submission.score !== null && typeof g.submission.score === 'number')
                .map(g => g.submission.score!) : [];
                
            let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
            if (recentGrades.length >= 6) {
                const recent5 = recentGrades.slice(0, 5);
                const previous5 = recentGrades.slice(5, 10);
                
                const recentAvg = recent5.reduce((sum, score) => sum + score, 0) / recent5.length;
                const previousAvg = previous5.reduce((sum, score) => sum + score, 0) / previous5.length;
                
                if (recentAvg > previousAvg + 3) recentTrend = 'improving';
                else if (recentAvg < previousAvg - 3) recentTrend = 'declining';
            }
            
            setAnalytics({
                overall_gpa: totalCourses > 0 ? Number((totalGradePoints / totalCourses).toFixed(2)) : 0,
                total_courses: totalCourses,
                grade_distribution: gradeDistribution,
                recent_trend: recentTrend,
                average_score: isNaN(averageScore) ? 0 : Number(averageScore.toFixed(1)),
                course_performance: coursePerformance
            });
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
        switch (trend) {
            case 'improving': return '↗️';
            case 'declining': return '↘️';
            case 'stable': return '➡️';
        }
    };

    const getTrendColor = (trend: 'improving' | 'declining' | 'stable') => {
        switch (trend) {
            case 'improving': return 'text-green-600';
            case 'declining': return 'text-red-600';
            case 'stable': return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-96 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Analytics</h3>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-96 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Analytics</h3>
                <div className="flex items-center justify-center h-full text-red-500">
                    <p>{error || 'No data available'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-96 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Grade Analytics</h3>
                <span className={`text-sm font-medium ${getTrendColor(analytics.recent_trend)}`}>
                    {getTrendIcon(analytics.recent_trend)} {analytics.recent_trend}
                </span>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                        {!isFinite(analytics.overall_gpa) ? '0.00' : analytics.overall_gpa.toFixed(2)}
                    </div>
                    <div className="text-xs text-blue-600">Overall GPA</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                        {!isFinite(analytics.average_score) || analytics.average_score === 0 ? 'N/A' : `${analytics.average_score.toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-green-600">Avg Score</div>
                </div>
            </div>
            
            {/* Course Performance */}
            <div className="space-y-2 h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Course Performance</h4>
                {analytics.course_performance.slice(0, 8).map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                                {course.course_code}
                            </span>
                            <span className={`text-xs ${getTrendColor(course.trend)}`}>
                                {getTrendIcon(course.trend)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                {!isFinite(course.average) || course.average === 0 ? 'N/A' : `${course.average.toFixed(1)}%`}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({course.grade_count})
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    );
}