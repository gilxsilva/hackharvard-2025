// Calendar API utilities with TypeScript
import { getCurrentUser } from './googleAuth';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Type definitions
export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  htmlLink?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  description?: string;
  htmlLink?: string;
}

export interface CalendarApiResponse {
  items: GoogleCalendarEvent[];
}

export const fetchCalendarEvents = async (
  timeMin: string | null = null, 
  timeMax: string | null = null
): Promise<CalendarEvent[]> => {
  const user = getCurrentUser();
  
  if (!user?.accessToken) {
    throw new Error('No access token available');
  }

  const now = new Date();
  const startOfDay = timeMin || new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = timeMax || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

  const params = new URLSearchParams({
    orderBy: 'startTime',
    singleEvents: 'true',
    timeMin: startOfDay,
    timeMax: endOfDay,
    maxResults: '50'
  });

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Calendar API error: ${response.status}`);
  }

  const data: CalendarApiResponse = await response.json();
  
  return data.items.map((event: GoogleCalendarEvent): CalendarEvent => ({
    id: event.id,
    summary: event.summary || 'Untitled Event',
    start: event.start.dateTime || event.start.date || '',
    end: event.end.dateTime || event.end.date || '',
    location: event.location,
    description: event.description,
    htmlLink: event.htmlLink
  }));
};

export const getTodayEvents = async (): Promise<CalendarEvent[]> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  
  return fetchCalendarEvents(startOfDay, endOfDay);
};

// New function to create calendar events
export const createCalendarEvent = async (event: {
  summary: string;
  description?: string;
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
  location?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}): Promise<CalendarEvent> => {
  const user = getCurrentUser();
  
  if (!user?.accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create calendar event: ${response.status}`);
  }

  const createdEvent: GoogleCalendarEvent = await response.json();
  
  return {
    id: createdEvent.id,
    summary: createdEvent.summary || 'Untitled Event',
    start: createdEvent.start.dateTime || createdEvent.start.date || '',
    end: createdEvent.end.dateTime || createdEvent.end.date || '',
    location: createdEvent.location,
    description: createdEvent.description,
    htmlLink: createdEvent.htmlLink
  };
};