import { NextResponse } from 'next/server';

interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
}

interface CanvasAssignment {
    id: number;
    name: string;
    points_possible: number;
    course_id: number;
    html_url: string;
}

interface CanvasSubmission {
    id: number;
    assignment_id: number;
    grade: string | null;
    score: number | null;
    late?: boolean;
    missing?: boolean;
    submitted_at: string | null;
    graded_at: string | null;
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

        // Fetch courses with student enrollment
        const coursesResponse = await fetch(
            `${baseUrl}/api/v1/courses?enrollment_type=student&enrollment_state=active&per_page=100`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!coursesResponse.ok) {
            return NextResponse.json(
                { error: `Canvas API error: ${coursesResponse.status} ${coursesResponse.statusText}` },
                { status: coursesResponse.status }
            );
        }

        const courses: CanvasCourse[] = await coursesResponse.json();
        const allGrades: any[] = [];

        // Fetch assignments with submissions for each course
        for (const course of courses) {
            try {
                // Get assignments with submissions included - much more efficient!
                const assignmentsResponse = await fetch(
                    `${baseUrl}/api/v1/courses/${course.id}/assignments?` +
                    `include[]=submission&` +
                    `per_page=100`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (assignmentsResponse.ok) {
                    const assignments: (CanvasAssignment & { submission?: CanvasSubmission })[] = await assignmentsResponse.json();

                    // Filter assignments that have been graded
                    const gradedAssignments = assignments
                        .filter(assignment =>
                            assignment.submission &&
                            (assignment.submission.grade !== null || assignment.submission.score !== null)
                        )
                        .map(assignment => ({
                            assignment: {
                                id: assignment.id,
                                name: assignment.name,
                                points_possible: assignment.points_possible,
                                course_id: assignment.course_id,
                                html_url: assignment.html_url
                            },
                            submission: assignment.submission!,
                            course_name: course.name,
                            course_code: course.course_code
                        }));

                    allGrades.push(...gradedAssignments);
                }
            } catch (error) {
                console.warn(`Failed to fetch assignments for course ${course.name}:`, error);
            }
        }

        // Sort by graded date (most recent first)
        allGrades.sort((a, b) => {
            const dateA = a.submission.graded_at ? new Date(a.submission.graded_at).getTime() : 0;
            const dateB = b.submission.graded_at ? new Date(b.submission.graded_at).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json(allGrades);
    } catch (error) {
        console.error('Error fetching Canvas grades:', error);
        return NextResponse.json(
            { error: 'Failed to fetch all grades' },
            { status: 500 }
        );
    }
}