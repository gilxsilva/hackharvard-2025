import { getCurrentUser } from './googleAuth';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export const fetchCalendarEvents = async (timeMin = null, timeMax = null) => {
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

  const data = await response.json();
  
  return data.items.map(event => ({
    id: event.id,
    summary: event.summary || 'Untitled Event',
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location,
    description: event.description,
    htmlLink: event.htmlLink
  }));
};

export const getTodayEvents = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  
  return fetchCalendarEvents(startOfDay, endOfDay);
};