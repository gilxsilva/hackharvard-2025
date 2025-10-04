import { Calendar, Clock } from 'lucide-react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

export default function ScheduleWidget() {
  const { events, loading, error } = useCalendarEvents();

  const todayEvents = events.filter(event => {
    const today = new Date().toDateString();
    return new Date(event.start).toDateString() === today;
  });

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Today's Schedule</h3>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading events...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load events</div>
      ) : todayEvents.length === 0 ? (
        <div className="text-gray-500">No events today</div>
      ) : (
        <div className="space-y-3">
          {todayEvents.map((event, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
              <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800">{event.summary}</div>
                <div className="text-sm text-gray-600">
                  {new Date(event.start).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
                {event.location && (
                  <div className="text-xs text-gray-500">{event.location}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ScheduleWidget.id = 'schedule';