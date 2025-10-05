import { NextResponse } from 'next/server';

interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
}

interface CanvasEnrollment {
    id: number;
    course_id: number;
    user_id: number;
    type: string;
    role: string;
    enrollment_state: string;
    grades: {
        current_grade: string | null;
        current_score: number | null;
        final_grade: string | null;
        final_score: number | null;
        unposted_current_score: number | null;
        unposted_final_score: number | null;
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

        // Fetch enrollments with grades
        const enrollmentsResponse = await fetch(`${baseUrl}/api/v1/users/self/enrollments?state[]=active&per_page=100&include[]=total_scores`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!enrollmentsResponse.ok) {
            return NextResponse.json(
                { error: `Canvas API error: ${enrollmentsResponse.status} ${enrollmentsResponse.statusText}` },
                { status: enrollmentsResponse.status }
            );
        }

        const enrollments: CanvasEnrollment[] = await enrollmentsResponse.json();

        // Fetch course details to get course names
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

        // Combine enrollment grades with course information
        const courseGrades = enrollments
            .filter(enrollment => enrollment.type === 'StudentEnrollment')
            .map(enrollment => {
                const course = courses.find(c => c.id === enrollment.course_id);
                return {
                    course_id: enrollment.course_id,
                    course_name: course?.name || 'Unknown Course',
                    course_code: course?.course_code || 'Unknown',
                    current_grade: enrollment.grades?.current_grade || null,
                    current_score: enrollment.grades?.current_score || null,
                    final_grade: enrollment.grades?.final_grade || null,
                    final_score: enrollment.grades?.final_score || null,
                    unposted_current_score: enrollment.grades?.unposted_current_score || null,
                    unposted_final_score: enrollment.grades?.unposted_final_score || null,
                };
            })
            .filter(grade =>
                // Only include courses that have some grade data
                grade.current_score !== null ||
                grade.final_score !== null ||
                grade.current_grade !== null ||
                grade.final_grade !== null
            );

        return NextResponse.json(courseGrades);
    } catch (error) {
        console.error('Error fetching Canvas course grades:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course grades' },
            { status: 500 }
        );
    }
}