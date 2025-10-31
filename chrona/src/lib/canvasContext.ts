// Enhanced Canvas data fetcher for AI chatbot context
import type { CanvasCourse, CanvasGrade, CanvasCourseGrade, CanvasAssignment } from '@/types/api';

export interface CanvasContext {
    courses: CanvasCourse[];
    grades: CanvasGrade[];
    courseGrades: CanvasCourseGrade[];
    upcomingAssignments: CanvasAssignment[];
    missingAssignments: CanvasAssignment[];
    calendarEvents: any[]; // Keep as any for now since calendar events structure varies
    lastUpdated: string;
}

export async function fetchCanvasContext(): Promise<CanvasContext> {
    try {
        console.log('🤖 ChatBot: Fetching Canvas context...');

        // Fetch all Canvas data in parallel for speed
        const [
            coursesResponse,
            gradesResponse,
            courseGradesResponse,
            upcomingResponse,
            missingResponse
        ] = await Promise.all([
            fetch('/api/canvas/courses').catch(() => null),
            fetch('/api/canvas/grades').catch(() => null),
            fetch('/api/canvas/course-grades').catch(() => null),
            fetch('/api/canvas/assignments/upcoming').catch(() => null),
            fetch('/api/canvas/missing-assignments').catch(() => null)
        ]);

        // Parse successful responses
        const courses = coursesResponse?.ok ? await coursesResponse.json() : [];
        const grades = gradesResponse?.ok ? await gradesResponse.json() : [];
        const courseGrades = courseGradesResponse?.ok ? await courseGradesResponse.json() : [];
        const upcomingAssignments = upcomingResponse?.ok ? await upcomingResponse.json() : [];
        const missingAssignments = missingResponse?.ok ? await missingResponse.json() : [];

        console.log('🤖 ChatBot: Canvas context loaded:', {
            courses: courses.length,
            grades: grades.length,
            courseGrades: courseGrades.length,
            upcomingAssignments: upcomingAssignments.length,
            missingAssignments: missingAssignments.length
        });

        return {
            courses,
            grades,
            courseGrades,
            upcomingAssignments,
            missingAssignments,
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