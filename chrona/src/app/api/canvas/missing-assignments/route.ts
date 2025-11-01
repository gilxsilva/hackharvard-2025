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
    submission_types: string[];
    submission?: {
        id: number;
        workflow_state: string;
        submitted_at: string | null;
        missing?: boolean;
        late?: boolean;
    };
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

        // First, fetch all active courses
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
        const missingAssignments: Array<CanvasAssignment & {
            course_name: string;
            course_code: string;
            urgency: string;
            days_until_due: number | null;
        }> = [];

        // Fetch assignments for each course
        for (const course of courses) {
            try {
                // Get assignments with submission info
                const assignmentsResponse = await fetch(
                    `${baseUrl}/api/v1/courses/${course.id}/assignments?` +
                    `include[]=submission&` +
                    `bucket=overdue,undated,unsubmitted&` +
                    `per_page=100`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (assignmentsResponse.ok) {
                    const assignments: CanvasAssignment[] = await assignmentsResponse.json();

                    // Filter for missing/unsubmitted assignments
                    const missing = assignments
                        .filter(assignment => {
                            if (!assignment.submission) return true; // No submission = missing

                            const submission = assignment.submission;
                            const isOverdue = assignment.due_at && new Date(assignment.due_at) < new Date();
                            const isUnsubmitted = submission.workflow_state === 'unsubmitted';
                            const isMissing = submission.missing === true;

                            return isUnsubmitted || isMissing || (isOverdue && !submission.submitted_at);
                        })
                        .map(assignment => ({
                            ...assignment,
                            course_name: course.name,
                            course_code: course.course_code,
                            urgency: assignment.due_at ?
                                (new Date(assignment.due_at) < new Date() ? 'overdue' :
                                    new Date(assignment.due_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? 'urgent' : 'normal')
                                : 'no_due_date',
                            days_until_due: assignment.due_at ?
                                Math.ceil((new Date(assignment.due_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null
                        }));

                    missingAssignments.push(...missing);
                }
            } catch (error) {
                console.warn(`Failed to fetch assignments for course ${course.name}:`, error);
            }
        }

        // Sort by urgency and due date
        missingAssignments.sort((a, b) => {
            // Prioritize by urgency
            const urgencyOrder: Record<string, number> = { 'overdue': 0, 'urgent': 1, 'normal': 2, 'no_due_date': 3 };
            const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            if (urgencyDiff !== 0) return urgencyDiff;

            // Then by due date
            if (!a.due_at && !b.due_at) return 0;
            if (!a.due_at) return 1;
            if (!b.due_at) return -1;
            return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
        });

        return NextResponse.json(missingAssignments);
    } catch (error) {
        console.error('Error fetching missing assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch missing assignments' },
            { status: 500 }
        );
    }
}