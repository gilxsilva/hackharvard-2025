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

export interface CanvasSubmission {
    id: number;
    assignment_id: number;
    user_id: number;
    grade: string | null;
    score: number | null;
    points_deducted?: number;
    late?: boolean;
    missing?: boolean;
    submitted_at: string | null;
    graded_at: string | null;
}

export interface CanvasGrade {
    assignment: CanvasAssignment;
    submission: CanvasSubmission;
    course_name: string;
    course_code: string;
}

export interface CanvasCourseGrade {
    course_id: number;
    course_name: string;
    course_code: string;
    current_grade: string | null;
    current_score: number | null;
    final_grade: string | null;
    final_score: number | null;
    unposted_current_score: number | null;
    unposted_final_score: number | null;
}

// Fetch user's active courses
export const fetchCanvasCourses = async (): Promise<CanvasCourse[]> => {
    console.log('Fetching courses from Canvas...');
    const response = await fetch('/api/canvas/courses');

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    const courses = await response.json();
    return courses;
};

// Fetch assignments for a specific course
export const fetchCourseAssignments = async (courseId: number): Promise<CanvasAssignment[]> => {
    console.log(`Fetching assignments for course ID: ${courseId}`);
    const response = await fetch(`/api/canvas/courses/${courseId}/assignments`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    const assignments = await response.json();

    return assignments;
};

// Fetch all upcoming assignments across all courses (optimized with single API call)
export const fetchUpcomingAssignments = async () => {
    try {
        console.log('Starting to fetch all upcoming assignments...');
        const response = await fetch('/api/canvas/assignments/upcoming');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
        }

        const upcomingAssignments = await response.json();

        upcomingAssignments.slice(0, 5).forEach((assignment: any, index: number) => {
            console.log(`  ${index + 1}. ${assignment.name} (${assignment.course_name}) - Due: ${assignment.due_at} - Points: ${assignment.points_possible}`);
        });

        return upcomingAssignments;
    } catch (error) {
        console.error('Error fetching Canvas assignments:', error);
        throw error;
    }
};

// Fetch grades for a specific course
export const fetchCourseGrades = async (courseId: number): Promise<CanvasGrade[]> => {
    console.log(`Fetching grades for course ID: ${courseId}`);
    const response = await fetch(`/api/canvas/courses/${courseId}/grades`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
    }

    const grades = await response.json();

    return grades;
};

// Fetch all grades across all courses
export const fetchAllGrades = async (): Promise<CanvasGrade[]> => {
    try {
        console.log('Starting to fetch all grades...');
        const response = await fetch('/api/canvas/grades');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
        }

        const grades = await response.json();

        return grades;
    } catch (error) {
        console.error('Error fetching Canvas grades:', error);
        throw error;
    }
};

// Fetch overall course grades (final grades for each course)
export const fetchOverallCourseGrades = async (): Promise<CanvasCourseGrade[]> => {
    try {
        console.log('Starting to fetch course grades...');
        const response = await fetch('/api/canvas/course-grades');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Canvas API error: ${response.status} ${errorData.error || response.statusText}`);
        }

        const courseGrades = await response.json();

        return courseGrades;
    } catch (error) {
        console.error('Error fetching Canvas course grades:', error);
        throw error;
    }
};