'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  eventDates: Set<string>; // Set of dates with events (YYYY-MM-DD format)
}

export default function MiniCalendar({ selectedDate, onDateSelect, eventDates }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const dateString = clickedDate.toISOString().split('T')[0];

    // Toggle: if same date clicked, deselect
    if (selectedDate && selectedDate.toISOString().split('T')[0] === dateString) {
      onDateSelect(null);
    } else {
      onDateSelect(clickedDate);
    }
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    return selectedDate.toISOString().split('T')[0] === dateString;
  };

  const hasEvents = (day: number) => {
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    return eventDates.has(dateString);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-2xl">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400" />
        </button>

        <h3 className="text-lg font-semibold text-white">
          {monthNames[month]} {year}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Actual days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const hasEvent = hasEvents(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                relative h-10 rounded-lg text-sm font-medium transition-all duration-200
                ${selected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                  : hasEvent
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }
              `}
            >
              {day}
              {hasEvent && !selected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <button
          onClick={() => onDateSelect(null)}
          className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {selectedDate ? 'Clear filter' : 'All events'}
        </button>
      </div>
    </div>
  );
}
