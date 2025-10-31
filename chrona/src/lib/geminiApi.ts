// Client-side Gemini API helper that calls our secure server-side endpoint

export interface SyllabusEvent {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    type?: string;
}

export interface CourseInfo {
    courseName?: string;
    courseCode?: string;
    instructor?: string;
    location?: string;
    schedule?: string;
}

export interface SyllabusParseResult {
    courseInfo: CourseInfo;
    events: SyllabusEvent[];
}

/**
 * Ask Gemini a question through our secure server-side API
 */
export const askGemini = async (question: string): Promise<string> => {
    try {
        const response = await fetch('/api/gemini/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data.response;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "I'm having trouble connecting to my AI assistant right now. Please try again in a moment.";
    }
};

/**
 * Parse syllabus text using Gemini through our secure server-side API
 */
export const callGeminiForEventParsing = async (
    text: string
): Promise<SyllabusParseResult> => {
    try {
        console.log("🔮 callGeminiForEventParsing invoked (client-side)");
        console.log("📝 Input text length:", text.length);

        const response = await fetch('/api/gemini/parse-syllabus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        console.log(`✅ Successfully parsed ${data.events.length} events from syllabus`);
        return data;
    } catch (error) {
        console.error("❌ Error parsing syllabus:", error);
        throw new Error(
            `Failed to parse syllabus: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
};