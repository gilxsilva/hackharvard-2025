import { NextResponse } from 'next/server';

interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
}

interface CanvasAssignment {
    id: number;
    name: string;
    description?: string;
    due_at: string | null;
    points_possible: number;
    course_id: number;
    html_url: string;
}

export async function GET() {
    try {
        const baseUrl = process.env.CANVAS_BASE_URL || process.env.NEXT_PUBLIC_CANVAS_BASE_URL;
        const accessToken = process.env.CANVAS_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CANVAS_ACCESS_TOKEN;

        if (!baseUrl || !accessToken) {
            return NextResponse.json(
                { error: 'Canvas configuration missing' },
                { status: 500 }
            );
        }

        // First, fetch all courses
        const coursesResponse = await fetch(`${baseUrl}/api/v1/courses?enrollment_state=active&per_page=100`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!coursesResponse.ok) {
            return NextResponse.json(
                { error: `Canvas API error: ${coursesResponse.status} ${coursesResponse.statusText}` },
                { status: coursesResponse.status }
            );
        }

        const courses: CanvasCourse[] = await coursesResponse.json();
        const allAssignments: (CanvasAssignment & { course_name: string })[] = [];

        // Fetch assignments for each course
        for (const course of courses) {
            try {
                const assignmentsResponse = await fetch(`${baseUrl}/api/v1/courses/${course.id}/assignments?per_page=100`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (assignmentsResponse.ok) {
                    const assignments: CanvasAssignment[] = await assignmentsResponse.json();
                    const assignmentsWithCourse = assignments.map(assignment => ({
                        ...assignment,
                        course_name: course.name
                    }));
                    allAssignments.push(...assignmentsWithCourse);
                }
            } catch (error) {
                console.warn(`Failed to fetch assignments for course ${course.name}:`, error);
            }
        }

        // Filter for upcoming assignments only
        const upcomingAssignments = allAssignments
            .filter(assignment =>
                assignment.due_at &&
                new Date(assignment.due_at) > new Date()
            )
            .sort((a, b) =>
                new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime()
            );

        return NextResponse.json(upcomingAssignments);
    } catch (error) {
        console.error('Error fetching Canvas assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch upcoming assignments' },
            { status: 500 }
        );
    }
}