'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, X, GraduationCap, FileText, BookOpen, Bell } from 'lucide-react';
import { SyllabusEvent } from '@/lib/gemini';

interface EventCardProps {
  event: SyllabusEvent;
  onUpdate: (event: SyllabusEvent) => void;
  onDelete: () => void;
  index: number;
}

const eventTypeConfig = {
  class: {
    icon: GraduationCap,
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/30',
    iconColor: 'text-indigo-400',
    label: 'Class',
  },
  exam: {
    icon: FileText,
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    label: 'Exam',
  },
  assignment: {
    icon: BookOpen,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    label: 'Assignment',
  },
  reminder: {
    icon: Bell,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    label: 'Reminder',
  },
};

export default function EventCard({ event, onUpdate, onDelete, index }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || eventTypeConfig.class;
  const Icon = config.icon;

  const handleSave = () => {
    onUpdate(editedEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(event);
    setIsEditing(false);
  };

  return (
    <div
      className={`
        group relative bg-gradient-to-br ${config.color} backdrop-blur-xl
        border ${config.borderColor} rounded-xl p-6
        hover:shadow-2xl hover:shadow-black/20 transition-all duration-300
        animate-fade-in-up
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900/50 hover:bg-rose-500/20
                   border border-zinc-700 hover:border-rose-500/50 opacity-0 group-hover:opacity-100
                   transition-all duration-200"
      >
        <X className="w-4 h-4 text-zinc-400 hover:text-rose-400" />
      </button>

      {/* Event Type Icon & Label */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-700`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        {isEditing ? (
          <select
            value={editedEvent.type || 'class'}
            onChange={(e) => setEditedEvent({ ...editedEvent, type: e.target.value })}
            className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="class">Class</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
            <option value="reminder">Reminder</option>
          </select>
        ) : (
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {config.label}
          </span>
        )}
      </div>

      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={editedEvent.title}
          onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
          className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2 text-lg font-semibold text-white mb-4 focus:outline-none focus:border-indigo-500"
        />
      ) : (
        <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2">
          {event.title}
        </h3>
      )}

      {/* Details Grid */}
      <div className="space-y-3">
        {/* Date */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-zinc-500" />
          {isEditing ? (
            <input
              type="text"
              value={editedEvent.date}
              onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
              placeholder="MM/DD/YYYY"
              className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <span className="text-sm text-zinc-300">{event.date}</span>
          )}
        </div>

        {/* Time */}
        {(isEditing || event.startTime) && (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-zinc-500" />
            {isEditing ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editedEvent.startTime || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, startTime: e.target.value })}
                  placeholder="Start time"
                  className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={editedEvent.endTime || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, endTime: e.target.value })}
                  placeholder="End time"
                  className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <span className="text-sm text-zinc-300">
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            )}
          </div>
        )}

        {/* Location */}
        {(isEditing || event.location) && (
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-zinc-500" />
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.location || ''}
                onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                placeholder="Location"
                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <span className="text-sm text-zinc-300">{event.location}</span>
            )}
          </div>
        )}
      </div>

      {/* Edit/Save Buttons */}
      <div className="mt-6 flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white text-sm font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            Edit Event
          </button>
        )}
      </div>
    </div>
  );
}
