export const mockCalendarEvents = [
  {
    id: '1',
    summary: 'Computer Science 101 - Lecture',
    start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    end: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
    location: 'Science Building Room 201',
    description: 'Introduction to Algorithms'
  },
  {
    id: '2',
    summary: 'Mathematics 201 - Tutorial',
    start: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    end: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    location: 'Math Building Room 105'
  },
  {
    id: '3',
    summary: 'Study Group - Physics',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    location: 'Library Study Room 3'
  },
  {
    id: '4',
    summary: 'Office Hours - Prof. Johnson',
    start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    location: 'Faculty Building Room 301'
  }
];

export const mockAssignments = [
  {
    id: '1',
    title: 'Data Structures Assignment',
    course: 'CS 201',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    priority: 'high'
  },
  {
    id: '2',
    title: 'Calculus Problem Set',
    course: 'MATH 101',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Physics Lab Report',
    course: 'PHYS 201',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
    priority: 'medium'
  },
  {
    id: '4',
    title: 'History Essay',
    course: 'HIST 101',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
    priority: 'low'
  },
  {
    id: '5',
    title: 'Chemistry Quiz',
    course: 'CHEM 101',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    priority: 'high'
  }
];

export const mockGrades = [
  {
    id: '1',
    course: 'CS 201',
    assignment: 'Midterm Exam',
    grade: 'A-',
    points: 3.7,
    date: '2024-10-01'
  },
  {
    id: '2',
    course: 'MATH 101',
    assignment: 'Quiz 3',
    grade: 'B+',
    points: 3.3,
    date: '2024-09-28'
  },
  {
    id: '3',
    course: 'PHYS 201',
    assignment: 'Lab Report 2',
    grade: 'A',
    points: 4.0,
    date: '2024-09-25'
  },
  {
    id: '4',
    course: 'HIST 101',
    assignment: 'Essay 1',
    grade: 'B',
    points: 3.0,
    date: '2024-09-20'
  },
  {
    id: '5',
    course: 'CHEM 101',
    assignment: 'Problem Set 4',
    grade: 'A-',
    points: 3.7,
    date: '2024-09-18'
  }
];