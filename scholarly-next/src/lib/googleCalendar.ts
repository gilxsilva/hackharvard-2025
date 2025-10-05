import { SyllabusEvent } from './gemini';

// Google Calendar API types
export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface GoogleCalendarBatchResponse {
  successful: number;
  failed: number;
  errors: Array<{
    eventTitle: string;
    error: string;
  }>;
}

/**
 * Maps event types to Google Calendar color IDs
 * https://developers.google.com/calendar/api/v3/reference/colors
 */
const EVENT_TYPE_COLORS: Record<string, string> = {
  class: '9',     // Blue
  exam: '11',     // Red
  assignment: '5', // Yellow
  reminder: '2',  // Green
};

/**
 * Converts a SyllabusEvent to Google Calendar API format
 */
export function formatSyllabusEventForGoogle(
  event: SyllabusEvent,
  courseInfo: { courseCode?: string; courseName?: string },
  userTimezone: string
): GoogleCalendarEvent {
  const { title, date, startTime, endTime, location, type } = event;

  console.log(`🔄 [Format] Processing: "${title}" on ${date} at ${startTime || 'all-day'}`);

  // Parse date (MM/DD/YYYY format from Gemini)
  const [month, day, year] = date.split('/').map(Number);
  console.log(`📅 [Format] Parsed date: ${year}-${month}-${day}`);

  // Build dateTime or use all-day date
  let start: GoogleCalendarEvent['start'];
  let end: GoogleCalendarEvent['end'];

  if (startTime && endTime) {
    // Timed event
    const startDateTime = parseDateTime(year, month, day, startTime, userTimezone);
    const endDateTime = parseDateTime(year, month, day, endTime, userTimezone);

    console.log(`⏰ [Format] Timed event: ${startDateTime} to ${endDateTime}`);

    start = { dateTime: startDateTime, timeZone: userTimezone };
    end = { dateTime: endDateTime, timeZone: userTimezone };
  } else {
    // All-day event
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log(`📆 [Format] All-day event: ${dateStr}`);

    start = { date: dateStr, timeZone: userTimezone };
    end = { date: dateStr, timeZone: userTimezone };
  }

  // Build description with course info
  const descriptionParts = ['Added from Chrona 📚'];
  if (courseInfo.courseName) {
    descriptionParts.push(`\nCourse: ${courseInfo.courseName}`);
  }
  if (courseInfo.courseCode) {
    descriptionParts.push(`\nCode: ${courseInfo.courseCode}`);
  }

  const googleEvent = {
    summary: title,
    description: descriptionParts.join(''),
    location: location || undefined,
    start,
    end,
    colorId: type ? EVENT_TYPE_COLORS[type] : undefined,
    reminders: {
      useDefault: false,
      overrides: getRemindersForEventType(type),
    },
  };

  console.log(`✅ [Format] Formatted event:`, JSON.stringify(googleEvent, null, 2));

  return googleEvent;
}

/**
 * Parses time string (e.g., "11:30 AM") and creates ISO datetime
 */
function parseDateTime(
  year: number,
  month: number,
  day: number,
  timeStr: string,
  timezone: string
): string {
  // Parse "11:30 AM" or "2:45 PM" format
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    // Fallback to noon if parsing fails
    return new Date(year, month - 1, day, 12, 0).toISOString();
  }

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridiem = match[3].toUpperCase();

  // Convert to 24-hour format
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  // Create date in local timezone, then convert to ISO
  const date = new Date(year, month - 1, day, hours, minutes);
  return date.toISOString();
}

/**
 * Returns appropriate reminders based on event type
 */
function getRemindersForEventType(type?: string) {
  switch (type) {
    case 'exam':
      return [
        { method: 'popup' as const, minutes: 24 * 60 }, // 1 day before
        { method: 'email' as const, minutes: 24 * 60 * 7 }, // 1 week before
      ];
    case 'assignment':
      return [
        { method: 'popup' as const, minutes: 24 * 60 }, // 1 day before
        { method: 'email' as const, minutes: 24 * 60 * 3 }, // 3 days before
      ];
    case 'class':
      return [
        { method: 'popup' as const, minutes: 10 }, // 10 minutes before
      ];
    default:
      return [
        { method: 'popup' as const, minutes: 30 }, // 30 minutes before
      ];
  }
}

/**
 * Creates a new Google Calendar for a course
 */
export async function createCourseCalendar(
  courseName: string,
  courseCode: string,
  accessToken: string
): Promise<string> {
  console.log(`📅 [Calendar] Creating calendar for ${courseCode}: ${courseName}`);

  const calendarName = `${courseCode}`;
  const emoji = getCourseEmojiFromCode(courseCode);

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `${emoji} ${calendarName}`,
        description: `Course calendar for ${courseName}\n\nCreated by Chrona 📚`,
        timeZone: getUserTimezone(),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`❌ [Calendar] Failed to create calendar:`, error);
    throw new Error(`Failed to create calendar: ${error.error?.message || response.statusText}`);
  }

  const calendar = await response.json();
  console.log(`✅ [Calendar] Created calendar with ID: ${calendar.id}`);
  return calendar.id;
}

/**
 * Helper to get emoji for a course code
 */
function getCourseEmojiFromCode(courseCode: string): string {
  const code = courseCode.toLowerCase();

  // Language courses
  if (code.includes('italian') || code.includes('itallang')) return '🇮🇹';
  if (code.includes('spanish') || code.includes('span')) return '🇪🇸';
  if (code.includes('french') || code.includes('fren')) return '🇫🇷';
  if (code.includes('german') || code.includes('germ')) return '🇩🇪';
  if (code.includes('chinese') || code.includes('chin')) return '🇨🇳';
  if (code.includes('japanese') || code.includes('jpn')) return '🇯🇵';

  // STEM courses
  if (code.includes('cs') || code.includes('compsci')) return '💻';
  if (code.includes('math') || code.includes('calc')) return '📐';
  if (code.includes('physics') || code.includes('phys')) return '⚛️';
  if (code.includes('chem')) return '🧪';
  if (code.includes('bio')) return '🧬';
  if (code.includes('eng')) return '⚙️';
  if (code.includes('data') || code.includes('ai')) return '🤖';

  // Humanities
  if (code.includes('hist')) return '📜';
  if (code.includes('econ')) return '📊';
  if (code.includes('educ')) return '💡';

  // Default
  return '📖';
}

/**
 * Adds a single event to Google Calendar
 */
export async function createGoogleCalendarEvent(
  event: GoogleCalendarEvent,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<void> {
  console.log(`📤 [Google Calendar] Creating event: ${event.summary}`);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error(`❌ [Google Calendar] Failed to create event "${event.summary}":`, error);
    throw new Error(`Failed to create event: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ [Google Calendar] Event created with ID: ${result.id}`);
}

/**
 * Adds multiple events to Google Calendar with rate limiting and retry logic
 * Uses Google Calendar Batch API for efficiency
 */
export async function createGoogleCalendarEventsBatch(
  events: GoogleCalendarEvent[],
  accessToken: string,
  calendarId: string = 'primary',
  onProgress?: (completed: number, total: number) => void
): Promise<GoogleCalendarBatchResponse> {
  const BATCH_SIZE = 50; // Google Calendar API limit
  const RATE_LIMIT_DELAY = 300; // ms between requests (increased for safety)

  console.log(`🔄 [Batch] Starting batch upload of ${events.length} events`);

  const result: GoogleCalendarBatchResponse = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  // Split events into batches
  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    console.log(`📦 [Batch] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}, events ${i + 1}-${i + batch.length}`);

    // Process batch with retry logic
    for (const event of batch) {
      try {
        await createEventWithRetry(event, accessToken, calendarId);
        result.successful++;
        console.log(`✅ [Batch] Progress: ${result.successful}/${events.length} successful`);

        if (onProgress) {
          onProgress(result.successful + result.failed, events.length);
        }
      } catch (error) {
        result.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [Batch] Failed to create "${event.summary}": ${errorMsg}`);
        result.errors.push({
          eventTitle: event.summary,
          error: errorMsg,
        });

        if (onProgress) {
          onProgress(result.successful + result.failed, events.length);
        }
      }

      // Small delay between individual requests to avoid rate limiting
      await delay(RATE_LIMIT_DELAY);
    }
  }

  console.log(`🏁 [Batch] Complete! Success: ${result.successful}, Failed: ${result.failed}`);
  return result;
}

/**
 * Creates a single event with exponential backoff retry logic
 */
async function createEventWithRetry(
  event: GoogleCalendarEvent,
  accessToken: string,
  calendarId: string,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await createGoogleCalendarEvent(event, accessToken, calendarId);
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Check if it's a rate limit error (429)
      if (lastError.message.includes('429') || lastError.message.includes('rate limit')) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.warn(`Rate limited, retrying after ${backoffDelay}ms...`);
        await delay(backoffDelay);
        continue;
      }

      // For other errors, don't retry
      throw lastError;
    }
  }

  throw lastError || new Error('Failed after max retries');
}

/**
 * Utility function for delays
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets the user's timezone from browser or defaults to a sensible fallback
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York'; // Fallback
  }
}

/**
 * Lists available timezones for user selection
 * Returns a curated list of common US timezones + user's detected timezone
 */
export function getCommonTimezones(): Array<{ value: string; label: string }> {
  const userTz = getUserTimezone();

  const commonTimezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona (No DST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan (JST)' },
    { value: 'Asia/Shanghai', label: 'China (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  ];

  // Add user's timezone if not in list
  if (!commonTimezones.find(tz => tz.value === userTz)) {
    commonTimezones.unshift({
      value: userTz,
      label: `${userTz} (Detected)`,
    });
  }

  return commonTimezones;
}
