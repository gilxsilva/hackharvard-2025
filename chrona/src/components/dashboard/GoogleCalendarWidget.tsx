'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink, RefreshCw } from 'lucide-react';
import Widget from './Widget';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status: string;
  htmlLink: string;
  colorId?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
}

interface TodayEventsResponse {
  success: boolean;
  events: GoogleCalendarEvent[];
  date: string;
  count: number;
}

interface GoogleCalendarWidgetProps {
  id: string;
  initialPosition: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  className?: string;
}

export default function GoogleCalendarWidget({ 
  id,
  initialPosition,
  onPositionChange,
  className = ''
}: GoogleCalendarWidgetProps) {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTodayEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/calendar/today-events');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: TodayEventsResponse = await response.json();
      
      if (data.success) {
        setEvents(data.events);
        setLastUpdated(new Date());
        console.log(`📅 Loaded ${data.events.length} events for today`);
      } else {
        throw new Error('Failed to fetch calendar events');
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayEvents();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchTodayEvents, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatEventTime = (event: GoogleCalendarEvent) => {
    if (event.start.date) {
      // All-day event
      return 'All day';
    }
    
    if (event.start.dateTime) {
      const startTime = new Date(event.start.dateTime);
      const endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;
      
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      
      const startStr = startTime.toLocaleTimeString('en-US', timeOptions);
      
      if (endTime && endTime.getTime() !== startTime.getTime()) {
        const endStr = endTime.toLocaleTimeString('en-US', timeOptions);
        return `${startStr} - ${endStr}`;
      }
      
      return startStr;
    }
    
    return 'Time TBD';
  };

  const getEventStatus = (event: GoogleCalendarEvent) => {
    if (event.start.dateTime) {
      const startTime = new Date(event.start.dateTime);
      const endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;
      const now = new Date();
      
      if (endTime && now > endTime) {
        return 'completed';
      } else if (now >= startTime && (!endTime || now <= endTime)) {
        return 'ongoing';
      } else {
        return 'upcoming';
      }
    }
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-gray-500';
      case 'ongoing':
        return 'text-green-400';
      case 'upcoming':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderEventCard = (event: GoogleCalendarEvent, index: number) => {
    const status = getEventStatus(event);
    const statusColor = getStatusColor(status);
    
    return (
      <div
        key={event.id}
        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all duration-200 animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-white text-sm line-clamp-2 flex-1">
            {event.summary}
          </h4>
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            {status === 'ongoing' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="Open in Google Calendar"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className={`flex items-center space-x-1 ${statusColor}`}>
            <Clock className="w-3 h-3" />
            <span>{formatEventTime(event)}</span>
            {status === 'ongoing' && <span className="text-green-400 font-medium">(Now)</span>}
          </div>
          
          {event.location && (
            <div className="flex items-center space-x-1 text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center space-x-1 text-gray-400">
              <Users className="w-3 h-3" />
              <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {event.description.replace(/<[^>]*>/g, '')} {/* Strip HTML tags */}
          </p>
        )}
      </div>
    );
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Widget
      id={id}
      title="📅 Today's Calendar"
      initialPosition={initialPosition}
      onPositionChange={onPositionChange}
      className={className}
      icon={<Calendar className="w-4 h-4 text-blue-400" />}
    >
      <div className="h-full flex flex-col">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {loading ? 'Loading...' : `${events.length} event${events.length !== 1 ? 's' : ''}`}
            </span>
            <span className="text-xs text-gray-400">{todayDate}</span>
          </div>
          
          <button
            onClick={fetchTodayEvents}
            disabled={loading}
            className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Calendar className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-red-400 text-sm mb-2">Failed to load events</p>
              <p className="text-gray-500 text-xs mb-3">{error}</p>
              <button
                onClick={fetchTodayEvents}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md text-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg animate-pulse">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Calendar className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-gray-400 text-sm mb-1">No events today</p>
              <p className="text-gray-500 text-xs">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1">
              {events.map((event, index) => renderEventCard(event, index))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lastUpdated && !loading && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
        )}
      </div>
    </Widget>
  );
}