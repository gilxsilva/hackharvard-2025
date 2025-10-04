// Utilities for converting parsed syllabus data into Google Calendar events

export const createCalendarEventsFromSyllabus = async (parsedData) => {
  const events = [];

  // Create recurring class events
  if (parsedData.meetingTimes && parsedData.meetingTimes.length > 0) {
    const classEvents = createClassEvents(parsedData);
    events.push(...classEvents);
  }

  // Create exam events with reminders
  if (parsedData.examDates && parsedData.examDates.length > 0) {
    const examEvents = createExamEvents(parsedData);
    events.push(...examEvents);
  }

  // Create assignment events with reminders
  if (parsedData.assignmentDates && parsedData.assignmentDates.length > 0) {
    const assignmentEvents = createAssignmentEvents(parsedData);
    events.push(...assignmentEvents);
  }

  // Create important date events
  if (parsedData.importantDates && parsedData.importantDates.length > 0) {
    const importantEvents = createImportantDateEvents(parsedData);
    events.push(...importantEvents);
  }

  return events;
};

const createClassEvents = (parsedData) => {
  const events = [];
  const { courseName, meetingTimes, location, instructor } = parsedData;

  // Generate recurring class sessions for the semester
  const semesterStart = new Date('2025-01-15'); // Spring 2025 start
  const semesterEnd = new Date('2025-05-15');   // Spring 2025 end

  meetingTimes.forEach(meeting => {
    if (meeting.day && meeting.time) {
      const dayOfWeek = getDayOfWeekNumber(meeting.day);
      const classTime = parseTime(meeting.time);

      // Generate events for each week of the semester
      for (let date = new Date(semesterStart); date <= semesterEnd; date.setDate(date.getDate() + 7)) {
        // Find the next occurrence of the meeting day
        const eventDate = getNextDayOfWeek(date, dayOfWeek);
        
        if (eventDate <= semesterEnd) {
          events.push({
            summary: courseName || 'Class',
            description: `Instructor: ${instructor || 'TBD'}`,
            start: {
              dateTime: combineDateAndTime(eventDate, classTime),
              timeZone: 'America/New_York'
            },
            end: {
              dateTime: combineDateAndTime(eventDate, addHours(classTime, 1)), // Assume 1-hour classes
              timeZone: 'America/New_York'
            },
            location: location || 'TBD',
            recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${semesterEnd.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 15 }
              ]
            }
          });
        }
      }
    }
  });

  return events;
};

const createExamEvents = (parsedData) => {
  const events = [];
  const { courseName, location } = parsedData;

  parsedData.examDates.forEach(exam => {
    const examDate = parseDate(exam.date);
    
    if (examDate) {
      // Main exam event
      events.push({
        summary: `${courseName || 'Course'} - ${exam.description}`,
        description: `Exam: ${exam.description}`,
        start: {
          dateTime: combineDateAndTime(examDate, '10:00'),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: combineDateAndTime(examDate, '12:00'),
          timeZone: 'America/New_York'
        },
        location: location || 'TBD',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 1440 } // 1 day before
          ]
        }
      });

      // Study reminder 2 weeks before
      const studyReminderDate = new Date(examDate);
      studyReminderDate.setDate(studyReminderDate.getDate() - 14);
      
      events.push({
        summary: `Study Reminder: ${exam.description}`,
        description: `Start studying for ${exam.description} - Exam is in 2 weeks`,
        start: {
          date: studyReminderDate.toISOString().split('T')[0]
        },
        end: {
          date: studyReminderDate.toISOString().split('T')[0]
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 0 },
            { method: 'email', minutes: 0 }
          ]
        }
      });
    }
  });

  return events;
};

const createAssignmentEvents = (parsedData) => {
  const events = [];
  const { courseName } = parsedData;

  parsedData.assignmentDates.forEach(assignment => {
    const dueDate = parseDate(assignment.date);
    
    if (dueDate) {
      // Assignment due event
      events.push({
        summary: `${courseName || 'Course'} - ${assignment.description}`,
        description: `Assignment Due: ${assignment.description}`,
        start: {
          date: dueDate.toISOString().split('T')[0]
        },
        end: {
          date: dueDate.toISOString().split('T')[0]
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 0 },
            { method: 'email', minutes: 1440 } // 1 day before
          ]
        }
      });

      // Work reminder 1 week before
      const workReminderDate = new Date(dueDate);
      workReminderDate.setDate(workReminderDate.getDate() - 7);
      
      events.push({
        summary: `Work on: ${assignment.description}`,
        description: `Start working on ${assignment.description} - Due in 1 week`,
        start: {
          date: workReminderDate.toISOString().split('T')[0]
        },
        end: {
          date: workReminderDate.toISOString().split('T')[0]
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 0 }
          ]
        }
      });
    }
  });

  return events;
};

const createImportantDateEvents = (parsedData) => {
  const events = [];
  const { courseName } = parsedData;

  parsedData.importantDates.forEach(important => {
    const eventDate = parseDate(important.date);
    
    if (eventDate) {
      events.push({
        summary: `${courseName || 'Course'} - ${important.description}`,
        description: important.description,
        start: {
          date: eventDate.toISOString().split('T')[0]
        },
        end: {
          date: eventDate.toISOString().split('T')[0]
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 0 }
          ]
        }
      });
    }
  });

  return events;
};

// Helper functions
const getDayOfWeekNumber = (dayName) => {
  const days = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  return days[dayName.toLowerCase()] || 1;
};

const getNextDayOfWeek = (date, dayOfWeek) => {
  const result = new Date(date);
  const currentDay = result.getDay();
  const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  result.setDate(result.getDate() + daysToAdd);
  return result;
};

const parseTime = (timeString) => {
  // Parse time strings like "10:00 AM", "2:30 PM", "14:30"
  const timeRegex = /(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i;
  const match = timeString.match(timeRegex);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3];

    if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  return { hours: 10, minutes: 0 }; // Default fallback
};

const parseDate = (dateString) => {
  // Handle various date formats
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const combineDateAndTime = (date, time) => {
  const result = new Date(date);
  result.setHours(time.hours, time.minutes, 0, 0);
  return result.toISOString();
};

const addHours = (time, hours) => {
  return {
    hours: time.hours + hours,
    minutes: time.minutes
  };
};