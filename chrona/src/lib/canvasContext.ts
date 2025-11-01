// Enhanced Canvas data fetcher for AI chatbot context
import type { CanvasCourse, CanvasGrade, CanvasCourseGrade, CanvasAssignment } from '@/types/api';

export interface CanvasContext {
    courses: CanvasCourse[];
    grades: CanvasGrade[];
    courseGrades: CanvasCourseGrade[];
    upcomingAssignments: CanvasAssignment[];
    missingAssignments: CanvasAssignment[];
    calendarEvents: Array<{ id: string; title: string; date: string }>; // Basic calendar event structure
    lastUpdated: string;
}

// Helper function to make internal API calls
async function fetchInternalAPI(endpoint: string): Promise<unknown[]> {
    try {
        // Construct the full URL for internal API calls
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.NEXTAUTH_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
                'User-Agent': 'Chrona-AI-Bot/1.0',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`🤖 Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.warn(`🤖 Error fetching ${endpoint}:`, error);
        return [];
    }
}

export async function fetchCanvasContext(): Promise<CanvasContext> {
    try {
        console.log('🤖 ChatBot: Fetching Canvas context...');

        // Fetch all Canvas data in parallel
        const [
            courses,
            grades,
            courseGrades,
            upcomingAssignments,
            missingAssignments
        ] = await Promise.all([
            fetchInternalAPI('/api/canvas/courses'),
            fetchInternalAPI('/api/canvas/grades'),
            fetchInternalAPI('/api/canvas/course-grades'),
            fetchInternalAPI('/api/canvas/assignments/upcoming'),
            fetchInternalAPI('/api/canvas/missing-assignments')
        ]);

        console.log('🤖 ChatBot: Canvas context loaded:', {
            courses: courses.length,
            grades: grades.length,
            courseGrades: courseGrades.length,
            upcomingAssignments: upcomingAssignments.length,
            missingAssignments: missingAssignments.length
        });

        return {
            courses: courses as CanvasCourse[],
            grades: grades as CanvasGrade[],
            courseGrades: courseGrades as CanvasCourseGrade[],
            upcomingAssignments: upcomingAssignments as CanvasAssignment[],
            missingAssignments: missingAssignments as CanvasAssignment[],
            calendarEvents: [], // TODO: Add calendar events if needed
            lastUpdated: new Date().toISOString()
        };

    } catch (error) {
        console.error('🤖 ChatBot: Error fetching Canvas context:', error);

        // Return empty context on error
        return {
            courses: [],
            grades: [],
            courseGrades: [],
            upcomingAssignments: [],
            missingAssignments: [],
            calendarEvents: [],
            lastUpdated: new Date().toISOString()
        };
    }
}