// Gemini AI integration for academic chat assistance
import { fetchCalendarEvents, CalendarEvent } from "./calendarApi";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

// Mock calendar events for fallback
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "1",
    summary: "Computer Science 101 - Lecture",
    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    location: "Science Building Room 201",
    description: "Introduction to Algorithms",
  },
  {
    id: "2",
    summary: "Mathematics 201 - Tutorial",
    start: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    location: "Math Building Room 105",
  },
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
      console.warn("Using mock calendar data:", error);
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: contextPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return generateFallbackResponse(question, mockCalendarEvents);
  }
};

const generateFallbackResponse = (
  question: string,
  calendarData: CalendarEvent[]
): string => {
  const lowerQuestion = question.toLowerCase();
  const today = new Date().toDateString();

  const todayEvents = calendarData.filter(
    (event) => new Date(event.start).toDateString() === today
  );

  if (lowerQuestion.includes("today") || lowerQuestion.includes("schedule")) {
    if (todayEvents.length === 0) {
      return "You don't have any events scheduled for today. Perfect time to catch up on assignments!";
    }

    const eventList = todayEvents
      .map(
        (event) =>
          `• ${event.summary} at ${new Date(event.start).toLocaleTimeString(
            "en-US",
            { hour: "numeric", minute: "2-digit", hour12: true }
          )}`
      )
      .join("\n");

    return `Here's what you have today:\n${eventList}`;
  }

  if (lowerQuestion.includes("next") || lowerQuestion.includes("upcoming")) {
    const nextEvent = calendarData.find(
      (event) => new Date(event.start) > new Date()
    );
    if (nextEvent) {
      const eventTime = new Date(nextEvent.start).toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `Your next event is "${nextEvent.summary}" on ${eventTime}`;
    }
    return "You don't have any upcoming events in the next week.";
  }

  return "I can help you with questions about your schedule, classes, and upcoming events. Try asking 'What do I have today?' or 'When is my next class?'";
};

// Syllabus Event type for calendar parsing
export interface SyllabusEvent {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type?: string;
}

// Course information extracted from syllabus
export interface CourseInfo {
  courseName?: string;
  courseCode?: string;
  instructor?: string;
  location?: string;
  schedule?: string;
}

// Combined response from Gemini
export interface SyllabusParseResult {
  courseInfo: CourseInfo;
  events: SyllabusEvent[];
}

/**
 * Calls Gemini API to parse syllabus text and extract calendar events + course info
 * @param text - Raw text extracted from syllabus PDF
 * @returns Course info and array of parsed syllabus events
 */
export async function callGeminiForEventParsing(
  text: string
): Promise<SyllabusParseResult> {
  try {
    console.log("🔮 callGeminiForEventParsing invoked");
    console.log("📝 Input text length:", text.length);
    console.log("📄 First 300 characters:", text.slice(0, 300));

    if (!GEMINI_API_KEY) {
      console.error("❌ Gemini API key is missing!");
      throw new Error("Gemini API key is not configured");
    }

    console.log("✅ API key found:", GEMINI_API_KEY.slice(0, 10) + "...");

    const prompt = `Parse the following college course syllabus and extract course information and calendar events.

Return a JSON object with two parts:

1. "courseInfo" - Extract course metadata:
   - courseName (string, e.g., "Introduction to Programming")
   - courseCode (string, e.g., "CS 101" or "ITALLANG 1A")
   - instructor (string, professor's name)
   - location (string, primary classroom location)
   - schedule (string, e.g., "MWF 10:00 AM" or "Tu/Th 2:00-3:30 PM")

2. "events" - Array of calendar events:
   - title (string)
   - date (MM/DD/YYYY format)
   - startTime (optional, e.g., "11:30 AM")
   - endTime (optional, e.g., "12:40 PM")
   - location (optional)
   - type (optional: "class", "exam", "assignment", "reminder")

Respond with valid JSON only (no explanations). Example format:
{
  "courseInfo": {
    "courseName": "Introduction to Italian",
    "courseCode": "ITALLANG 1A",
    "instructor": "Dr. Maria Rossi",
    "location": "Room 360-361A",
    "schedule": "MWF 11:30 AM - 12:40 PM"
  },
  "events": [
    {
      "title": "Lecture: Course Presentation",
      "date": "09/22/2025",
      "startTime": "11:30 AM",
      "endTime": "12:40 PM",
      "location": "Room 360-361A",
      "type": "class"
    }
  ]
}

Here is the syllabus text:
"""
${text}
"""`;

    console.log("🌐 Calling Gemini API for syllabus parsing...");
    console.log("🔗 API URL:", GEMINI_API_URL);
    console.log("📦 Prompt length:", prompt.length);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini API error response:", errorText);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    console.log("✅ Gemini API responded successfully");

    const data: GeminiResponse = await response.json();
    const rawResponse = data.candidates[0].content.parts[0].text;

    console.log("📨 Gemini raw response length:", rawResponse.length);
    console.log("📨 Gemini raw response:", rawResponse);

    // Extract JSON from response (Gemini sometimes wraps it in markdown code blocks)
    let jsonString = rawResponse.trim();

    // Remove markdown code blocks if present
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/```\n?/g, "");
    }

    console.log("🔧 Cleaned JSON string:", jsonString.slice(0, 200));

    // Parse the JSON response
    const result: SyllabusParseResult = JSON.parse(jsonString);

    console.log(`✅ Successfully parsed ${result.events.length} events from syllabus`);
    console.log("📋 Course Info:", JSON.stringify(result.courseInfo, null, 2));
    console.log("📋 Parsed events:", JSON.stringify(result.events, null, 2));

    return result;
  } catch (error) {
    console.error("❌ Error parsing syllabus with Gemini:", error);
    if (error instanceof SyntaxError) {
      console.error("❌ JSON parsing failed - raw response may not be valid JSON");
    }
    throw new Error(
      `Failed to parse syllabus: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
