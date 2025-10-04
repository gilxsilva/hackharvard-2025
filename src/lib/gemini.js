import { fetchCalendarEvents } from './calendarApi';
import { mockCalendarEvents } from '../data/mockData';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const askGemini = async (question) => {
  try {
    let calendarData;
    
    try {
      calendarData = await fetchCalendarEvents();
    } catch (error) {
      console.warn('Using mock calendar data:', error.message);
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

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateFallbackResponse(question, calendarData);
  }
};

const generateFallbackResponse = (question, calendarData) => {
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