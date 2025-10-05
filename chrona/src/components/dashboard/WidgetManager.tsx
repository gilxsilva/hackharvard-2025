'use client';

import { useState } from 'react';
import { Eye, EyeOff, Grid3x3, X } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  category: 'academic' | 'calendar' | 'analytics';
}

interface WidgetManagerProps {
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onToggleAll: (visible: boolean) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function WidgetManager({ widgets, onToggleWidget, onToggleAll, isOpen: externalIsOpen, onToggle }: WidgetManagerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  const visibleCount = widgets.filter(w => w.visible).length;
  const categoryGroups = widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, WidgetConfig[]>);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-6 z-40 p-3 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-xl border border-purple-500/50 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20"
        title="Manage Widgets"
      >
        <Grid3x3 className="w-5 h-5 text-purple-300" />
        <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {visibleCount}
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel Content */}
          <div className="fixed top-24 right-6 w-96 max-h-[70vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">Manage Widgets</h3>
                <p className="text-xs text-gray-400">{visibleCount} of {widgets.length} visible</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 p-4 border-b border-white/10">
              <button
                onClick={() => onToggleAll(true)}
                className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 text-sm font-medium rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Show All
              </button>
              <button
                onClick={() => onToggleAll(false)}
                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 text-sm font-medium rounded-lg transition-colors"
              >
                <EyeOff className="w-4 h-4 inline mr-1" />
                Hide All
              </button>
            </div>

            {/* Widget List by Category */}
            <div className="overflow-y-auto max-h-[calc(70vh-12rem)] p-4 space-y-4">
              {Object.entries(categoryGroups).map(([category, categoryWidgets]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryWidgets.map((widget) => (
                      <button
                        key={widget.id}
                        onClick={() => onToggleWidget(widget.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          widget.visible
                            ? 'bg-white/5 border-white/20 hover:bg-white/10'
                            : 'bg-white/0 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <span className={`text-sm font-medium ${widget.visible ? 'text-white' : 'text-gray-500'}`}>
                          {widget.title}
                        </span>
                        {widget.visible ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
