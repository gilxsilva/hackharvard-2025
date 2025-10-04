export interface CanvasAssignment {
    id: number;
    name: string;
    description?: string;
    due_at: string | null;
    points_possible: number;
    course_id: number;
    html_url: string;
}

export interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
}

// Fetch user's active courses
export const fetchCanvasCourses = async (): Promise<CanvasCourse[]> => {
    console.log('🔍 Fetching courses from Canvas...');
    const response = await fetch('/api/canvas/courses');

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    const courses = await response.json();
    console.log('📚 Courses received:', courses.length, 'active courses');
    console.log('📋 Course list:', courses.map((c: CanvasCourse) => ({ id: c.id, name: c.name, code: c.course_code })));

    return courses;
};

// Fetch assignments for a specific course
export const fetchCourseAssignments = async (courseId: number): Promise<CanvasAssignment[]> => {
    console.log(`📝 Fetching assignments for course ID: ${courseId}`);
    const response = await fetch(`/api/canvas/courses/${courseId}/assignments`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    const assignments = await response.json();
    console.log(`📋 Course ${courseId} assignments:`, assignments.length, 'total assignments');

    return assignments;
};

// Fetch all upcoming assignments across all courses (optimized with single API call)
export const fetchUpcomingAssignments = async () => {
    try {
        console.log('🚀 Starting to fetch all upcoming assignments...');
        const response = await fetch('/api/canvas/assignments/upcoming');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
        }

        const upcomingAssignments = await response.json();

        console.log(`⏰ Retrieved ${upcomingAssignments.length} upcoming assignments`);
        console.log('📋 Upcoming assignments details:');
        upcomingAssignments.slice(0, 5).forEach((assignment: any, index: number) => {
            console.log(`  ${index + 1}. ${assignment.name} (${assignment.course_name}) - Due: ${assignment.due_at} - Points: ${assignment.points_possible}`);
        });

        return upcomingAssignments;
    } catch (error) {
        console.error('Error fetching Canvas assignments:', error);
        throw error;
    }
};