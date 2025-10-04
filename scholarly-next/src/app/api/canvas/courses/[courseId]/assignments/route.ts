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

        const response = await fetch(`${baseUrl}/api/v1/courses/${courseId}/assignments?per_page=100`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Canvas API error:', response.status, response.statusText);
            return NextResponse.json(
                { error: `Canvas API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const assignments = await response.json();
        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error fetching Canvas assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}