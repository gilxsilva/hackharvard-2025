import { NextResponse } from 'next/server';

interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
    enrollments?: CanvasEnrollment[];
}

interface CanvasEnrollment {
    id: number;
    course_id: number;
    user_id: number;
    type: string;
    role: string;
    enrollment_state: string;
    computed_current_score: number | null;
    computed_final_score: number | null;
    computed_current_grade: string | null;
    computed_final_grade: string | null;
    unposted_current_score?: number | null;
    unposted_final_score?: number | null;
    unposted_current_grade?: string | null;
    unposted_final_grade?: string | null;
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

        // Fetch courses with grade information included
        const coursesResponse = await fetch(
            `${baseUrl}/api/v1/courses?` +
            `enrollment_type=student&` +
            `enrollment_state=active&` +
            `include[]=total_scores&` +
            `per_page=50`,
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



        // Extract grade information from courses
        const courseGrades = courses
            .filter(course => course.enrollments && course.enrollments.length > 0)
            .map(course => {
                // Get the student enrollment (should be only one since we filtered by enrollment_type=student)
                const studentEnrollment = course.enrollments!.find(enrollment =>
                    enrollment.type === 'student' || enrollment.type === 'StudentEnrollment'
                );

                if (!studentEnrollment) {
                    return null;
                }

                const gradeResult = {
                    course_id: course.id,
                    course_name: course.name,
                    course_code: course.course_code,
                    current_grade: studentEnrollment.computed_current_grade || null,
                    current_score: studentEnrollment.computed_current_score || null,
                    final_grade: studentEnrollment.computed_final_grade || null,
                    final_score: studentEnrollment.computed_final_score || null,
                    unposted_current_score: studentEnrollment.unposted_current_score || null,
                    unposted_final_score: studentEnrollment.unposted_final_score || null,
                    unposted_current_grade: studentEnrollment.unposted_current_grade || null,
                    unposted_final_grade: studentEnrollment.unposted_final_grade || null,
                };

                return gradeResult;
            })
            .filter(grade => grade !== null); // Show all courses, even without grades



        return NextResponse.json(courseGrades);
    } catch (error) {
        console.error('Error fetching Canvas course grades:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course grades' },
            { status: 500 }
        );
    }
}