import { NextResponse } from 'next/server';

interface CanvasCalendarEvent {
    id: number;
    title: string;
    description?: string;
    start_at: string;
    end_at: string;
    all_day: boolean;
    context_code: string;
    context_name: string;
    workflow_state: string;
    url?: string;
    html_url?: string;
    type: 'event' | 'assignment';
    location_name?: string;
    location_address?: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('start_date') || new Date().toISOString();
        const endDate = searchParams.get('end_date') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const baseUrl = process.env.CANVAS_BASE_URL || process.env.NEXT_PUBLIC_CANVAS_BASE_URL;
        const accessToken = process.env.CANVAS_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CANVAS_ACCESS_TOKEN;

        if (!baseUrl || !accessToken) {
            return NextResponse.json(
                { error: 'Canvas configuration missing' },
                { status: 500 }
            );
        }

        // Fetch calendar events
        const eventsResponse = await fetch(
            `${baseUrl}/api/v1/calendar_events?` +
            `start_date=${startDate}&` +
            `end_date=${endDate}&` +
            `per_page=100&` +
            `context_codes[]=course&` +
            `all_events=true`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!eventsResponse.ok) {
            return NextResponse.json(
                { error: `Canvas API error: ${eventsResponse.status} ${eventsResponse.statusText}` },
                { status: eventsResponse.status }
            );
        }

        const events: CanvasCalendarEvent[] = await eventsResponse.json();

        // Enhance events with additional metadata
        const enhancedEvents = events.map(event => ({
            ...event,
            course_code: event.context_code.replace('course_', ''),
            is_today: new Date(event.start_at).toDateString() === new Date().toDateString(),
            is_upcoming: new Date(event.start_at) > new Date(),
            duration_minutes: event.end_at ?
                (new Date(event.end_at).getTime() - new Date(event.start_at).getTime()) / 60000 : null
        }));

        // Sort by start date
        enhancedEvents.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

        return NextResponse.json(enhancedEvents);
    } catch (error) {
        console.error('Error fetching Canvas calendar events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch calendar events' },
            { status: 500 }
        );
    }
}