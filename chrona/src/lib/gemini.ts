// Enhanced Gemini AI integration with full Canvas context
import { fetchCalendarEvents, CalendarEvent } from "./calendarApi";
import { fetchCanvasContext, CanvasContext } from "./canvasContext";

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
    // Fetch comprehensive Canvas context
    const canvasContext = await fetchCanvasContext();

    // Build comprehensive context prompt
    const contextPrompt = buildCanvasContextPrompt(question, canvasContext);

    if (!GEMINI_API_KEY) {
      return generateEnhancedFallbackResponse(question, canvasContext);
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Enhanced Gemini API error:", error);
    const fallbackContext = await fetchCanvasContext();
    return generateEnhancedFallbackResponse(question, fallbackContext);
  }
};

// Build comprehensive context prompt with all Canvas data
const buildCanvasContextPrompt = (question: string, context: CanvasContext): string => {
  const currentDate = new Date().toISOString();

  return `
You are Chrona, an intelligent academic assistant for a college student. You have comprehensive access to their Canvas LMS data and can answer questions about their courses, grades, assignments, and academic performance.

=== STUDENT'S CURRENT ACADEMIC DATA ===

📚 ENROLLED COURSES (${context.courses.length} total):
${context.courses.map(course => `
  • ${course.course_code || course.name}
    Name: ${course.name}
    ID: ${course.id}
`).join('')}

📊 COURSE GRADES & PERFORMANCE:
${context.courseGrades.map(grade => `
  • ${grade.course_code}
    Current Grade: ${grade.current_grade || 'No grade'} (${grade.current_score || 'N/A'}%)
    Final Grade: ${grade.final_grade || 'No final grade'} (${grade.final_score || 'N/A'}%)
`).join('')}

📝 UPCOMING ASSIGNMENTS (Next 10):
${context.upcomingAssignments.slice(0, 10).map(assignment => `
  • ${assignment.name}
    Course: ${assignment.course_code}
    Due: ${assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'No due date'}
    Points: ${assignment.points_possible || 0}
`).join('')}

⚠️  MISSING ASSIGNMENTS (${context.missingAssignments.length} total):
${context.missingAssignments.slice(0, 5).map(assignment => `
  • ${assignment.name}
    Course: ${assignment.course_code}
    Due: ${assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'No due date'}
    Points: ${assignment.points_possible || 0}
`).join('')}

📈 RECENT GRADES (Last 5):
${context.grades.slice(0, 5).map(grade => `
  • ${grade.assignment.name}
    Course: ${grade.course_code}
    Score: ${grade.submission.score}/${grade.assignment.points_possible}
    Graded: ${grade.submission.graded_at ? new Date(grade.submission.graded_at).toLocaleDateString() : 'Not graded'}
`).join('')}

=== CONTEXT INFO ===
Current Date/Time: ${currentDate}
Data Last Updated: ${context.lastUpdated}

=== USER QUESTION ===
${question}

=== INSTRUCTIONS ===
Please provide a helpful, accurate response based on the student's actual Canvas data above. You can:

1. **Academic Performance**: Discuss grades, GPA trends, course performance
2. **Assignment Management**: Help with upcoming deadlines, missing work, workload planning  
3. **Course Information**: Provide details about enrolled courses, schedules
4. **Study Planning**: Suggest priorities based on upcoming assignments and grades
5. **Progress Tracking**: Analyze grade trends and academic progress

**FORMATTING REQUIREMENTS:**
- Use **bold text** for important information, course names, grades, and key points
- Use *italic text* for emphasis, suggestions, and secondary information
- Use bullet points (•) for lists and organized information
- Use numbers (1., 2., 3.) for step-by-step instructions or rankings
- Include emojis when appropriate: 📊 for grades, 📚 for courses, ⏰ for deadlines, 📝 for assignments, ⚠️ for warnings, 🎉 for good news
- Use \`code blocks\` for technical terms or specific values
- Structure responses with clear headings using ## or ### when appropriate
- Keep paragraphs concise and scannable

Be conversational, supportive, and specific. Use the actual data provided. If asked about something not in the data, explain what information you do have access to.

If the question is completely unrelated to academics, politely redirect to academic topics while being friendly.
`;
};

// Enhanced fallback response generator using Canvas context
const generateEnhancedFallbackResponse = (
  question: string,
  context: CanvasContext
): string => {
  const lowerQuestion = question.toLowerCase();

  // Handle grades questions
  if (lowerQuestion.includes('grade') || lowerQuestion.includes('score')) {
    if (context.courseGrades.length > 0) {
      const gradesInfo = context.courseGrades
        .filter(grade => grade.current_grade)
        .map(grade => `• **${grade.course_code}**: ${grade.current_grade} (${grade.current_score}%)`)
        .join('\n');
      return `📊 **Your Current Grades:**\n\n${gradesInfo}`;
    }
    return "📊 I don't see any grades available in your Canvas data yet.";
  }

  // Handle assignments questions  
  if (lowerQuestion.includes('assignment') || lowerQuestion.includes('due') || lowerQuestion.includes('homework')) {
    if (context.upcomingAssignments.length > 0) {
      const upcomingInfo = context.upcomingAssignments.slice(0, 3)
        .map(assignment => `• **${assignment.name}** (*${assignment.course_code}*) - ⏰ Due: ${assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'No due date'}`)
        .join('\n');
      return `📝 **Your Upcoming Assignments:**\n\n${upcomingInfo}`;
    }
    return "📝 You don't have any upcoming assignments showing in Canvas right now.";
  }

  // Handle missing assignments
  if (lowerQuestion.includes('missing') || lowerQuestion.includes('late')) {
    if (context.missingAssignments.length > 0) {
      const missingInfo = context.missingAssignments.slice(0, 3)
        .map(assignment => `• **${assignment.name}** (*${assignment.course_code}*)`)
        .join('\n');
      return `⚠️ **Missing Assignments** (${context.missingAssignments.length} total):\n\n${missingInfo}`;
    }
    return "🎉 **Great news!** You don't have any missing assignments.";
  }

  // Handle courses questions
  if (lowerQuestion.includes('course') || lowerQuestion.includes('class')) {
    if (context.courses.length > 0) {
      const coursesInfo = context.courses
        .map(course => `• **${course.course_code || course.name}**`)
        .join('\n');
      return `📚 **Your Enrolled Courses** (${context.courses.length} total):\n\n${coursesInfo}`;
    }
    return "📚 I don't see any courses in your Canvas data.";
  }

  // Default response
  return `👋 **Hi there!** I'm your *academic assistant* powered by Canvas data.\n\n**I can help you with:**\n• 📊 **Grades** and academic performance\n• 📝 **Assignments** and deadlines\n• 📚 **Courses** and schedules\n• ⚠️ **Missing work** tracking\n\n*What would you like to know about your academics?*`;
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
      `Failed to parse syllabus: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
