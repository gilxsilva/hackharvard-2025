// Gemini AI integration for academic chat assistance
import { fetchCalendarEvents, CalendarEvent } from './calendarApi';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Mock calendar events for fallback
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    summary: 'Computer Science 101 - Lecture',
    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    location: 'Science Building Room 201',
    description: 'Introduction to Algorithms'
  },
  {
    id: '2',
    summary: 'Mathematics 201 - Tutorial',
    start: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    location: 'Math Building Room 105'
  }
];

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const askGemini = async (question: string): Promise<string> => {
  try {
    let calendarData: CalendarEvent[];
    
    try {
      calendarData = await fetchCalendarEvents();
    } catch (error) {
      console.warn('Using mock calendar data:', error);
      calendarData = mockCalendarEvents;
    }

    const contextPrompt = `
You are a helpful academic assistant for a college student. You have access to their calendar data.

Current calendar events:
${JSON.stringify(calendarData, null, 2)}

Current date and time: ${new Date().toISOString()}

User question: ${question}

Please provide a helpful, concise response about their schedule, classes, or academic activities. If the question is not related to their calendar or academics, politely redirect them to academic-related queries.
`;

    if (!GEMINI_API_KEY) {
      return generateFallbackResponse(question, calendarData);
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: contextPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateFallbackResponse(question, mockCalendarEvents);
  }
};

const generateFallbackResponse = (question: string, calendarData: CalendarEvent[]): string => {
  const lowerQuestion = question.toLowerCase();
  const today = new Date().toDateString();
  
  const todayEvents = calendarData.filter(event => 
    new Date(event.start).toDateString() === today
  );

  if (lowerQuestion.includes('today') || lowerQuestion.includes('schedule')) {
    if (todayEvents.length === 0) {
      return "You don't have any events scheduled for today. Perfect time to catch up on assignments!";
    }
    
    const eventList = todayEvents.map(event => 
      `• ${event.summary} at ${new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    ).join('\n');
    
    return `Here's what you have today:\n${eventList}`;
  }

  if (lowerQuestion.includes('next') || lowerQuestion.includes('upcoming')) {
    const nextEvent = calendarData.find(event => new Date(event.start) > new Date());
    if (nextEvent) {
      const eventTime = new Date(nextEvent.start).toLocaleDateString('en-US', { 
        weekday: 'long', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      return `Your next event is "${nextEvent.summary}" on ${eventTime}`;
    }
    return "You don't have any upcoming events in the next week.";
  }

  return "I can help you with questions about your schedule, classes, and upcoming events. Try asking 'What do I have today?' or 'When is my next class?'";
};