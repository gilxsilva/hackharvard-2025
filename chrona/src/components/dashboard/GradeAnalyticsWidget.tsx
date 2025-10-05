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

    if (loading) {
        return (
            <div className={`space-y-3 ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className={`space-y-3 ${className}`}>
                <div className="flex items-center justify-center h-64 text-red-400">
                    <p className="text-sm">{error || 'No data available'}</p>
                </div>
            </div>
        );
    }

    const getTrendColorDark = (trend: 'improving' | 'declining' | 'stable') => {
        switch (trend) {
            case 'improving': return 'text-green-400';
            case 'declining': return 'text-red-400';
            case 'stable': return 'text-gray-400';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getTrendColorDark(analytics.recent_trend)}`}>
                    {getTrendIcon(analytics.recent_trend)} {analytics.recent_trend}
                </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-blue-400">
                        {!isFinite(analytics.overall_gpa) ? '0.00' : analytics.overall_gpa.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Overall GPA</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-3xl font-bold text-green-400">
                        {!isFinite(analytics.average_score) || analytics.average_score === 0 ? 'N/A' : `${analytics.average_score.toFixed(1)}%`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Avg Score</div>
                </div>
            </div>

            {/* Course Performance */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Course Performance</h4>
                {analytics.course_performance.slice(0, 8).map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                                {course.course_code}
                            </span>
                            <span className={`text-xs ${getTrendColorDark(course.trend)}`}>
                                {getTrendIcon(course.trend)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-300">
                                {!isFinite(course.average) || course.average === 0 ? 'N/A' : `${course.average.toFixed(1)}%`}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({course.grade_count})
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}