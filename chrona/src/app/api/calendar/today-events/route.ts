import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface GoogleCalendarEventSimple {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status: string;
  htmlLink: string;
  colorId?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
}

export async function GET(_request: NextRequest) {
  try {
    console.log('📅 [API] Fetching today\'s calendar events...');

    // Get the user's session
    const session = await getServerSession(authOptions);

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

    // Get today's date range (start and end of day)
    const today = new Date();
    const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Format dates for Google Calendar API (RFC3339 format)
    const timeMinISO = timeMin.toISOString();
    const timeMaxISO = timeMax.toISOString();

    console.log('📆 [API] Date range:', { timeMinISO, timeMaxISO });

    // Build Google Calendar API URL
    const calendarId = 'primary'; // User's primary calendar
    const params = new URLSearchParams({
      timeMin: timeMinISO,
      timeMax: timeMaxISO,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50', // Limit to 50 events for today
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
    console.log('🌐 [API] Calling Google Calendar API:', url);

    // Fetch events from Google Calendar
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Google Calendar API error:', response.status, errorText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Google Calendar access denied. Please check your permissions.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Google Calendar API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ [API] Successfully fetched ${data.items?.length || 0} events for today`);

    // Process and filter events
    const events: GoogleCalendarEventSimple[] = (data.items || [])
      .filter((event: { status?: string; start?: { dateTime?: string; date?: string } }) => {
        // Filter out cancelled events and events without start time
        return event.status !== 'cancelled' && (event.start?.dateTime || event.start?.date);
      })
      .map((event: {
        id: string;
        summary?: string;
        description?: string;
        location?: string;
        start?: { dateTime?: string; date?: string; timeZone?: string };
        end?: { dateTime?: string; date?: string; timeZone?: string };
        status: string;
        htmlLink: string;
        colorId?: string;
        attendees?: Array<{ email: string; displayName?: string; responseStatus: string }>;
      }) => ({
        id: event.id,
        summary: event.summary || 'Untitled Event',
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start?.dateTime,
          date: event.start?.date,
          timeZone: event.start?.timeZone,
        },
        end: {
          dateTime: event.end?.dateTime,
          date: event.end?.date,
          timeZone: event.end?.timeZone,
        },
        status: event.status,
        htmlLink: event.htmlLink,
        colorId: event.colorId,
        attendees: event.attendees?.map((attendee: { email: string; displayName?: string; responseStatus: string }) => ({
          email: attendee.email,
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus as 'needsAction' | 'declined' | 'tentative' | 'accepted',
        })),
      }));

    // Sort events by start time
    events.sort((a, b) => {
      const aTime = new Date(a.start.dateTime || a.start.date || 0).getTime();
      const bTime = new Date(b.start.dateTime || b.start.date || 0).getTime();
      return aTime - bTime;
    });

    console.log('📋 [API] Returning processed events:', events.length);

    return NextResponse.json({
      success: true,
      events,
      date: today.toISOString().split('T')[0],
      count: events.length,
    });

  } catch (error) {
    console.error('❌ [API] Error fetching calendar events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch calendar events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}