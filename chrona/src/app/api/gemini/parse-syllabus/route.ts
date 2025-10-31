import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Syllabus text is required and must be a string' },
                { status: 400 }
            );
        }

        console.log("🔮 callGeminiForEventParsing invoked (server-side)");
        console.log("📝 Input text length:", text.length);
        console.log("📄 First 300 characters:", text.slice(0, 300));

        if (!GEMINI_API_KEY) {
            console.error("❌ Gemini API key is missing!");
            return NextResponse.json(
                { error: 'Gemini API key is not configured' },
                { status: 500 }
            );
        }

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

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            return NextResponse.json(
                { error: `Gemini API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        console.log("✅ Gemini API responded successfully");

        const data: GeminiResponse = await response.json();
        const rawResponse = data.candidates[0].content.parts[0].text;

        console.log("📨 Gemini raw response length:", rawResponse.length);

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
        const result = JSON.parse(jsonString);

        console.log(`✅ Successfully parsed ${result.events.length} events from syllabus`);
        console.log("📋 Course Info:", JSON.stringify(result.courseInfo, null, 2));

        return NextResponse.json(result);
    } catch (error) {
        console.error("❌ Error parsing syllabus with Gemini:", error);

        if (error instanceof SyntaxError) {
            console.error("❌ JSON parsing failed - raw response may not be valid JSON");
            return NextResponse.json(
                { error: 'Failed to parse Gemini response as JSON' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to parse syllabus' },
            { status: 500 }
        );
    }
}