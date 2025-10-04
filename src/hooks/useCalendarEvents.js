import { useState, useEffect } from 'react';
import { fetchCalendarEvents } from '../lib/calendarApi';
import { mockCalendarEvents } from '../data/mockData';
import { useAuth } from './useAuth';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadEvents = async () => {
      if (!isAuthenticated) {
        setEvents(mockCalendarEvents);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const calendarEvents = await fetchCalendarEvents();
        setEvents(calendarEvents);
      } catch (err) {
        console.warn('Failed to fetch calendar events, using mock data:', err.message);
        setEvents(mockCalendarEvents);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [isAuthenticated]);

  return { events, loading, error };
};