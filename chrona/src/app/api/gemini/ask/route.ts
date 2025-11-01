import { NextRequest, NextResponse } from 'next/server';
import { fetchCanvasContext, CanvasContext } from '@/lib/canvasContext';

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
        const { question } = await request.json();

        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Question is required and must be a string' },
                { status: 400 }
            );
        }

        // Fetch comprehensive Canvas context
        console.log('🤖 Fetching Canvas context for question:', question);
        const canvasContext = await fetchCanvasContext();
        console.log('🤖 Canvas context summary:', {
            courses: canvasContext.courses.length,
            grades: canvasContext.grades.length,
            courseGrades: canvasContext.courseGrades.length,
            upcomingAssignments: canvasContext.upcomingAssignments.length,
            missingAssignments: canvasContext.missingAssignments.length
        });

        // Build comprehensive context prompt
        const contextPrompt = buildCanvasContextPrompt(question, canvasContext);

        if (!GEMINI_API_KEY) {
            const fallbackResponse = generateEnhancedFallbackResponse(question, canvasContext);
            return NextResponse.json({ response: fallbackResponse });
        }

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
                                text: contextPrompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3, // Lower temperature for more focused responses
                    maxOutputTokens: 400, // Reduced from 1000 to keep responses concise
                    topP: 0.8, // More focused response generation
                    topK: 20, // Limit vocabulary for more precise answers
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Gemini API error ${response.status}:`, errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        console.log('🔍 Gemini API response structure:', JSON.stringify(data, null, 2));

        // Validate response structure
        if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
            console.error('❌ Invalid Gemini response: no candidates found');
            throw new Error('Invalid response from Gemini API');
        }

        if (!data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
            console.error('❌ Invalid Gemini response: no content parts found');
            throw new Error('Invalid response structure from Gemini API');
        }

        const geminiResponse = data.candidates[0].content.parts[0].text;

        if (!geminiResponse) {
            console.error('❌ Empty response from Gemini API');
            throw new Error('Empty response from Gemini API');
        }

        return NextResponse.json({ response: geminiResponse });
    } catch (error) {
        console.error('Gemini API error:', error);

        try {
            const fallbackContext = await fetchCanvasContext();
            const fallbackResponse = generateEnhancedFallbackResponse(
                (await request.json()).question || 'general help',
                fallbackContext
            );
            return NextResponse.json({ response: fallbackResponse });
        } catch (fallbackError) {
            return NextResponse.json(
                { error: 'Failed to process request' },
                { status: 500 }
            );
        }
    }
}

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
    Course: ${assignment.course_name}
    Due: ${assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'No due date'}
    Points: ${assignment.points_possible || 0}
`).join('')}

⚠️  MISSING ASSIGNMENTS (${context.missingAssignments.length} total):
${context.missingAssignments.slice(0, 5).map(assignment => `
  • ${assignment.name}
    Course: ${assignment.course_name}
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
Provide a **concise, focused response** based on the student's Canvas data above. **Keep responses under 3 sentences when possible.**

**RESPONSE GUIDELINES:**
1. **Direct & Brief** - Answer the specific question asked, don't elaborate beyond what's needed
2. **Data-Driven** - Use actual numbers, dates, and course names from the Canvas data
3. **Action-Oriented** - When relevant, provide 1-2 specific next steps
4. **Academic Focus** - Stay on topic about grades, assignments, courses, or study planning

**FORMATTING (use sparingly):**
- **Bold** for key information (grades, due dates, course names)
- Bullet points (•) only for lists of 2+ items
- Emojis: 📊 grades, 📚 courses, ⏰ deadlines, 📝 assignments, ⚠️ warnings

**FORBIDDEN:**
- Long explanations or background information
- Multiple paragraphs unless absolutely necessary
- Repetitive information or obvious statements
- Academic advice unless specifically requested

If asked about non-academic topics, redirect briefly: "I'm focused on your academics. What would you like to know about your courses, grades, or assignments?"
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
                .map(assignment => `• **${assignment.name}** (*${assignment.course_name}*) - ⏰ Due: ${assignment.due_at ? new Date(assignment.due_at).toLocaleDateString() : 'No due date'}`)
                .join('\n');
            return `📝 **Your Upcoming Assignments:**\n\n${upcomingInfo}`;
        }
        return "📝 You don't have any upcoming assignments showing in Canvas right now.";
    }

    // Handle missing assignments
    if (lowerQuestion.includes('missing') || lowerQuestion.includes('late')) {
        if (context.missingAssignments.length > 0) {
            const missingInfo = context.missingAssignments.slice(0, 3)
                .map(assignment => `• **${assignment.name}** (*${assignment.course_name}*)`)
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