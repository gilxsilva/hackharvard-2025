// Sample syllabus data for testing and demo purposes

export const sampleSyllabusText = `
Computer Science 101 - Introduction to Programming
Instructor: Dr. Sarah Johnson
Fall 2025 Semester

Contact Information:
Email: s.johnson@university.edu
Office: Science Building Room 305
Office Hours: Tuesday, Thursday 2:00 PM - 4:00 PM

Class Schedule:
Monday, Wednesday, Friday 10:00 AM - 11:00 AM
Location: Science Building Room 201

Course Description:
This course provides a comprehensive introduction to computer programming concepts using Python. Students will learn fundamental programming constructs, problem-solving techniques, and software development practices.

Important Dates:
Assignment 1 Due: February 1, 2025
Midterm Exam: March 15, 2025
Assignment 2 Due: March 1, 2025
Spring Break: March 22-29, 2025
Assignment 3 Due: April 5, 2025
Final Project Due: April 25, 2025
Final Exam: May 10, 2025

Grading:
Assignments (3): 45%
Midterm Exam: 20%
Final Project: 20%
Final Exam: 15%

Required Materials:
- Textbook: "Python Programming: An Introduction" 3rd Edition
- Laptop with Python 3.8+ installed
- Access to university coding platform

Weekly Schedule:
Week 1 (Jan 15): Introduction to Programming
Week 2 (Jan 22): Variables and Data Types
Week 3 (Jan 29): Control Structures
Week 4 (Feb 5): Functions and Modules
Week 5 (Feb 12): Lists and Dictionaries
Week 6 (Feb 19): File I/O Operations
Week 7 (Feb 26): Error Handling
Week 8 (Mar 5): Object-Oriented Programming
Week 9 (Mar 12): Review and Midterm
Week 10 (Mar 19): Data Structures
Week 11 (Mar 26): Spring Break - No Class
Week 12 (Apr 2): Algorithms and Complexity
Week 13 (Apr 9): Web Programming Basics
Week 14 (Apr 16): Final Project Work
Week 15 (Apr 23): Project Presentations
Week 16 (Apr 30): Final Review
`;

export const sampleParsedSyllabus = {
  courseName: 'Computer Science 101 - Introduction to Programming',
  instructor: 'Dr. Sarah Johnson',
  meetingTimes: [
    { day: 'Monday', time: '10:00 AM' },
    { day: 'Wednesday', time: '10:00 AM' },
    { day: 'Friday', time: '10:00 AM' }
  ],
  location: 'Science Building Room 201',
  examDates: [
    {
      type: 'exam',
      description: 'Midterm Exam',
      date: 'March 15, 2025'
    },
    {
      type: 'exam',
      description: 'Final Exam',
      date: 'May 10, 2025'
    }
  ],
  assignmentDates: [
    {
      type: 'assignment',
      description: 'Assignment 1 Due',
      date: 'February 1, 2025'
    },
    {
      type: 'assignment',
      description: 'Assignment 2 Due',
      date: 'March 1, 2025'
    },
    {
      type: 'assignment',
      description: 'Assignment 3 Due',
      date: 'April 5, 2025'
    },
    {
      type: 'assignment',
      description: 'Final Project Due',
      date: 'April 25, 2025'
    }
  ],
  importantDates: [
    {
      type: 'important',
      description: 'Spring Break',
      date: 'March 22, 2025'
    }
  ]
};

export const sampleCalendarEvents = [
  {
    summary: 'Computer Science 101 - Introduction to Programming',
    description: 'Instructor: Dr. Sarah Johnson',
    start: {
      dateTime: '2025-01-15T10:00:00-05:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2025-01-15T11:00:00-05:00',
      timeZone: 'America/New_York'
    },
    location: 'Science Building Room 201',
    recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20250515T000000Z']
  },
  {
    summary: 'Computer Science 101 - Midterm Exam',
    description: 'Exam: Midterm Exam',
    start: {
      dateTime: '2025-03-15T10:00:00-05:00',
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: '2025-03-15T12:00:00-05:00',
      timeZone: 'America/New_York'
    },
    location: 'Science Building Room 201'
  },
  {
    summary: 'Study Reminder: Midterm Exam',
    description: 'Start studying for Midterm Exam - Exam is in 2 weeks',
    start: {
      date: '2025-03-01'
    },
    end: {
      date: '2025-03-01'
    }
  }
];