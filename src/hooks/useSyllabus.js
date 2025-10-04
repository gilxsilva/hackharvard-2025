import { useState } from 'react';
import { parseSyllabusFile } from '../lib/syllabusParser';
import { createCalendarEventsFromSyllabus } from '../lib/calendarUtils';

export const useSyllabus = () => {
  const [syllabus, setSyllabus] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  const uploadSyllabus = async (file) => {
    setLoading(true);
    setError(null);

    try {
      // Parse the syllabus file
      const parsed = await parseSyllabusFile(file);
      setParsedData(parsed);
      setSyllabus(file);

      // Generate calendar events from parsed data
      const calendarEvents = await createCalendarEventsFromSyllabus(parsed);
      setEvents(calendarEvents);

      return { parsed, events: calendarEvents };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearSyllabus = () => {
    setSyllabus(null);
    setParsedData(null);
    setEvents([]);
    setError(null);
  };

  const addEventsToCalendar = async () => {
    if (!events.length) {
      throw new Error('No events to add to calendar');
    }

    setLoading(true);
    try {
      // In a real implementation, this would call Google Calendar API
      // For demo, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Events added to calendar:', events);
      return { success: true, eventsAdded: events.length };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    syllabus,
    parsedData,
    events,
    loading,
    error,
    uploadSyllabus,
    clearSyllabus,
    addEventsToCalendar
  };
};