import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  createGoogleCalendarEventsBatch,
  formatSyllabusEventForGoogle,
  createCourseCalendar,
  GoogleCalendarBatchResponse,
} from '@/lib/googleCalendar';
import { SyllabusEvent, CourseInfo } from '@/lib/gemini';

export interface AddEventsRequest {
  events: SyllabusEvent[];
  courseInfo: CourseInfo;
  timezone: string;
  calendarId?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📅 [API] Starting calendar sync...');

    // Get the user's session with authOptions
    const session = await getServerSession(authOptions);
    console.log('🔐 [API] Session:', session ? 'Found' : 'Not found');
    console.log('🔑 [API] Access token:', session?.accessToken ? 'Present' : 'Missing');

    if (!session || !session.accessToken) {
      console.error('❌ [API] No session or access token');
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in with Google.' },
        { status: 401 }
      );
    }

    // Check if token refresh failed
    if (session.error === 'RefreshAccessTokenError') {
      console.error('❌ [API] Token refresh failed');
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AddEventsRequest = await request.json();
    const { events, courseInfo, timezone, calendarId = 'primary' } = body;

    console.log(`📊 [API] Received ${events.length} events to sync`);
    console.log(`🌍 [API] Timezone: ${timezone}`);
    console.log(`📋 [API] Course: ${courseInfo.courseCode} - ${courseInfo.courseName}`);

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: 'No events provided' },
        { status: 400 }
      );
    }

    if (!timezone) {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }

    // Create a dedicated calendar for this course if we have course info
    let targetCalendarId = calendarId;
    if (courseInfo.courseCode && courseInfo.courseName) {
      console.log(`📅 [API] Creating dedicated calendar for ${courseInfo.courseCode}...`);
      try {
        targetCalendarId = await createCourseCalendar(
          courseInfo.courseName,
          courseInfo.courseCode,
          session.accessToken
        );
        console.log(`✅ [API] Using calendar ID: ${targetCalendarId}`);
      } catch (error) {
        console.warn('⚠️ [API] Failed to create course calendar, falling back to primary');
        console.error(error);
        // Fall back to primary calendar if creation fails
        targetCalendarId = 'primary';
      }
    }

    // Convert syllabus events to Google Calendar format
    console.log('🔄 [API] Converting events to Google Calendar format...');
    const googleEvents = events.map(event =>
      formatSyllabusEventForGoogle(event, courseInfo, timezone)
    );
    console.log('✅ [API] Events converted:', googleEvents.length);
    console.log('📝 [API] First event:', JSON.stringify(googleEvents[0], null, 2));

    // Add events to Google Calendar with batch processing
    console.log(`🚀 [API] Starting batch upload to calendar ${targetCalendarId}...`);
    const result: GoogleCalendarBatchResponse = await createGoogleCalendarEventsBatch(
      googleEvents,
      session.accessToken,
      targetCalendarId
    );

    console.log(`✅ [API] Sync complete! Success: ${result.successful}, Failed: ${result.failed}`);
    if (result.errors.length > 0) {
      console.error('❌ [API] Errors:', result.errors);
    }

    // Return result
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('❌ [API] Error adding events to Google Calendar:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to add events',
      },
      { status: 500 }
    );
  }
}
