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
        const canvasContext = await fetchCanvasContext();

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
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        const geminiResponse = data.candidates[0].content.parts[0].text;

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