// Syllabus parsing utilities for extracting structured data from uploaded files

export const parseSyllabusFile = async (file) => {
  try {
    const text = await extractTextFromFile(file);
    return parseSyllabusText(text);
  } catch (error) {
    console.error('Error parsing syllabus file:', error);
    throw new Error('Failed to parse syllabus file');
  }
};

const extractTextFromFile = async (file) => {
  const fileType = file.type;
  
  if (fileType === 'text/plain') {
    return await file.text();
  } else if (fileType === 'application/pdf') {
    // For hackathon: return mock text since PDF parsing requires additional libraries
    return getMockSyllabusText();
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For hackathon: return mock text since DOCX parsing requires additional libraries
    return getMockSyllabusText();
  } else {
    throw new Error('Unsupported file type');
  }
};

export const parseSyllabusText = (text) => {
  const parsed = {
    courseName: extractCourseName(text),
    instructor: extractInstructor(text),
    meetingTimes: extractMeetingTimes(text),
    location: extractLocation(text),
    examDates: extractExamDates(text),
    assignmentDates: extractAssignmentDates(text),
    importantDates: extractImportantDates(text)
  };

  return parsed;
};

const extractCourseName = (text) => {
  // Look for common course name patterns
  const patterns = [
    /(?:Course|Subject):\s*([^\n\r]+)/i,
    /([A-Z]{2,4}\s+\d{3}[A-Z]?)\s*[:-]\s*([^\n\r]+)/i,
    /^([A-Z][^.\n\r]+(?:Programming|Science|Mathematics|Engineering|History|English|Biology|Chemistry|Physics)[^\n\r]*)/im
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return 'Course Name Not Found';
};

const extractInstructor = (text) => {
  const patterns = [
    /(?:Instructor|Professor|Teacher):\s*([^\n\r]+)/i,
    /(?:Prof\.?|Dr\.?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return 'Instructor Not Found';
};

const extractMeetingTimes = (text) => {
  const patterns = [
    /(?:Class|Meeting|Schedule).*?([A-Za-z]+day).*?(\d{1,2}:\d{2}(?:\s*[AP]M)?)/gi,
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday).*?(\d{1,2}:\d{2}(?:\s*[AP]M)?)/gi
  ];

  const times = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      times.push({
        day: match[1],
        time: match[2]
      });
    }
  }

  return times.length > 0 ? times : [{ day: 'Schedule Not Found', time: '' }];
};

const extractLocation = (text) => {
  const patterns = [
    /(?:Location|Room|Building):\s*([^\n\r]+)/i,
    /(?:Room|Rm\.?)\s+([A-Z]?\d+[A-Z]?)/i,
    /([A-Z][a-z]+\s+Building.*?Room\s+\d+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return 'Location Not Found';
};

const extractExamDates = (text) => {
  const examKeywords = /(?:exam|midterm|final|quiz|test)/gi;
  const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/gi;
  
  const lines = text.split('\n');
  const examDates = [];

  for (const line of lines) {
    if (examKeywords.test(line)) {
      const dates = line.match(datePattern);
      if (dates) {
        examDates.push({
          type: 'exam',
          description: line.trim(),
          date: dates[0]
        });
      }
    }
  }

  return examDates;
};

const extractAssignmentDates = (text) => {
  const assignmentKeywords = /(?:assignment|homework|project|paper|essay|due)/gi;
  const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/gi;
  
  const lines = text.split('\n');
  const assignmentDates = [];

  for (const line of lines) {
    if (assignmentKeywords.test(line)) {
      const dates = line.match(datePattern);
      if (dates) {
        assignmentDates.push({
          type: 'assignment',
          description: line.trim(),
          date: dates[0]
        });
      }
    }
  }

  return assignmentDates;
};

const extractImportantDates = (text) => {
  const importantKeywords = /(?:holiday|break|deadline|presentation|conference)/gi;
  const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/gi;
  
  const lines = text.split('\n');
  const importantDates = [];

  for (const line of lines) {
    if (importantKeywords.test(line)) {
      const dates = line.match(datePattern);
      if (dates) {
        importantDates.push({
          type: 'important',
          description: line.trim(),
          date: dates[0]
        });
      }
    }
  }

  return importantDates;
};

const getMockSyllabusText = () => {
  return `
Computer Science 101 - Introduction to Programming
Instructor: Dr. Sarah Johnson
Fall 2025

Class Schedule:
Monday, Wednesday, Friday 10:00 AM - 11:00 AM
Location: Science Building Room 201

Important Dates:
Midterm Exam: March 15, 2025
Final Exam: May 10, 2025
Assignment 1 Due: February 1, 2025
Assignment 2 Due: March 1, 2025
Final Project Due: April 25, 2025

Course Description:
This course provides an introduction to computer programming concepts...
`;
};