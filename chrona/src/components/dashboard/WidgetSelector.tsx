'use client';

import { useState } from 'react';
import { X, Settings, Eye, EyeOff, BookOpen, Calendar as CalendarIcon, Award, BarChart3 } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  glowColor: 'purple' | 'blue' | 'red' | 'green';
  enabled: boolean;
}

interface WidgetSelectorProps {
  widgets: WidgetConfig[];
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
  onClose: () => void;
}

export default function WidgetSelector({ widgets, onWidgetsChange, onClose }: WidgetSelectorProps) {
  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    onWidgetsChange(updatedWidgets);
  };

  const enabledCount = widgets.filter(w => w.enabled).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-cosmic-glow max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Customize Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">
              {enabledCount} of {widgets.length} widgets enabled
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => onWidgetsChange(widgets.map(w => ({ ...w, enabled: true })))}
                className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-xs"
              >
                Enable All
              </button>
              <button
                onClick={() => onWidgetsChange(widgets.map(w => ({ ...w, enabled: false })))}
                className="px-3 py-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs"
              >
                Disable All
              </button>
            </div>
          </div>
        </div>

        {/* Widget List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 gap-3">
            {widgets.map(widget => (
              <div
                key={widget.id}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer
                  ${widget.enabled 
                    ? 'bg-white/5 border-white/20 shadow-widget-glow-sm' 
                    : 'bg-white/2 border-white/5'
                  }
                  hover:bg-white/10 hover:border-white/30
                `}
                onClick={() => toggleWidget(widget.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-lg transition-all
                      ${widget.enabled ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/40'}
                    `}>
                      {widget.icon}
                    </div>
                    <div>
                      <h3 className={`font-medium transition-all ${
                        widget.enabled ? 'text-white' : 'text-white/60'
                      }`}>
                        {widget.title}
                      </h3>
                      <p className={`text-sm transition-all ${
                        widget.enabled ? 'text-white/60' : 'text-white/40'
                      }`}>
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`
                        w-12 h-6 rounded-full transition-all cursor-pointer
                        ${widget.enabled ? 'bg-green-500' : 'bg-white/20'}
                      `}
                    >
                      <div
                        className={`
                          w-5 h-5 bg-white rounded-full shadow-lg transform transition-all
                          ${widget.enabled ? 'translate-x-6' : 'translate-x-0.5'}
                        `}
                      />
                    </div>
                    {widget.enabled ? (
                      <Eye className="w-4 h-4 text-green-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <p className="text-xs text-white/40">
              Drag widgets to reorder them on your dashboard
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the default widget configurations
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'courses',
    title: 'My Courses',
    description: 'View and manage your enrolled courses',
    icon: <BookOpen className="w-5 h-5" />,
    glowColor: 'green',
    enabled: true
  },
  {
    id: 'assignments',
    title: 'Upcoming Assignments',
    description: 'Track assignments and due dates',
    icon: <CalendarIcon className="w-5 h-5" />,
    glowColor: 'blue',
    enabled: true
  },
  {
    id: 'grades',
    title: 'Course Grades',
    description: 'Monitor your academic performance',
    icon: <Award className="w-5 h-5" />,
    glowColor: 'purple',
    enabled: true
  },
  {
    id: 'stats',
    title: 'Weekly Overview',
    description: 'Summary of your weekly progress',
    icon: <BarChart3 className="w-5 h-5" />,
    glowColor: 'purple',
    enabled: true
  },
  {
    id: 'calendar',
    title: 'Smart Calendar',
    description: 'AI-powered schedule management',
    icon: <CalendarIcon className="w-5 h-5" />,
    glowColor: 'blue',
    enabled: true
  },
  {
    id: 'google-calendar',
    title: 'Google Calendar',
    description: 'Sync with your Google Calendar events',
    icon: <CalendarIcon className="w-5 h-5" />,
    glowColor: 'green',
    enabled: true
  },
  {
    id: 'missing',
    title: 'Missing Assignments',
    description: 'Track overdue and missing work',
    icon: <Award className="w-5 h-5" />,
    glowColor: 'red',
    enabled: true
  },
  {
    id: 'analytics',
    title: 'Grade Analytics',
    description: 'Detailed performance insights',
    icon: <BarChart3 className="w-5 h-5" />,
    glowColor: 'green',
    enabled: true
  },
  {
    id: 'workload',
    title: 'Course Workload',
    description: 'Balance your academic workload',
    icon: <BookOpen className="w-5 h-5" />,
    glowColor: 'purple',
    enabled: true
  },
  {
    id: 'activity',
    title: 'Recent Activity',
    description: 'Latest updates and notifications',
    icon: <BarChart3 className="w-5 h-5" />,
    glowColor: 'blue',
    enabled: true
  }
];