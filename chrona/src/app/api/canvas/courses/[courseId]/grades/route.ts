import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const baseUrl = process.env.CANVAS_BASE_URL || process.env.NEXT_PUBLIC_CANVAS_BASE_URL;
        const accessToken = process.env.CANVAS_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CANVAS_ACCESS_TOKEN;
        const courseId = params.courseId;

        if (!baseUrl || !accessToken) {
            return NextResponse.json(
                { error: 'Canvas configuration missing' },
                { status: 500 }
            );
        }

        // First fetch assignments for the course
        const assignmentsResponse = await fetch(`${baseUrl}/api/v1/courses/${courseId}/assignments?per_page=100`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!assignmentsResponse.ok) {
            return NextResponse.json(
                { error: `Canvas API error: ${assignmentsResponse.status} ${assignmentsResponse.statusText}` },
                { status: assignmentsResponse.status }
            );
        }

        const assignments = await assignmentsResponse.json();

        // Then fetch submissions for each assignment
        const gradesData = [];

        for (const assignment of assignments) {
            try {
                const submissionsResponse = await fetch(`${baseUrl}/api/v1/courses/${courseId}/assignments/${assignment.id}/submissions/self`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (submissionsResponse.ok) {
                    const submission = await submissionsResponse.json();
                    // Only include graded submissions
                    if (submission.grade !== null || submission.score !== null) {
                        gradesData.push({
                            assignment,
                            submission
                        });
                    }
                }
            } catch (error) {
                console.warn(`Failed to fetch submission for assignment ${assignment.id}:`, error);
            }
        }

        return NextResponse.json(gradesData);
    } catch (error) {
        console.error('Error fetching Canvas grades:', error);
        return NextResponse.json(
            { error: 'Failed to fetch grades' },
            { status: 500 }
        );
    }
}