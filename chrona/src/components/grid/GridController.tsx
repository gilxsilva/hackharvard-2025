'use client';

import React from 'react';
import { Orbit, LayoutGrid, Sparkles, Grid2x2 } from 'lucide-react';
import { LayoutMode } from '@/utils/layoutAlgorithms';

interface GridControllerProps {
  isGridEnabled: boolean;
  showGuides: boolean;
  currentLayout: LayoutMode;
  onToggleGrid: () => void;
  onToggleGuides: () => void;
  onChangeLayout: (layout: LayoutMode) => void;
  onAutoArrange: (layout?: LayoutMode) => void;
}

export default function GridController({
  isGridEnabled,
  showGuides,
  currentLayout,
  onToggleGrid,
  onToggleGuides,
  onChangeLayout,
  onAutoArrange
}: GridControllerProps) {
  const layouts: Array<{ mode: LayoutMode; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { mode: 'orbital', icon: Orbit, label: 'Orbital' },
    { mode: 'masonry', icon: LayoutGrid, label: 'Masonry' },
    { mode: 'spiral', icon: Sparkles, label: 'Spiral' },
    { mode: 'grid', icon: Grid2x2, label: 'Grid' }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end space-y-3">
      {/* Layout Selector */}
      <div className="bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-3">
        <div className="text-xs text-gray-400 mb-2 font-medium">Auto-Arrange</div>
        <div className="grid grid-cols-2 gap-2">
          {layouts.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => {
                onChangeLayout(mode);
                // Pass the layout mode directly to avoid async state issues
                onAutoArrange(mode);
              }}
              className={`p-2 rounded-lg border transition-all duration-200 ${
                currentLayout === mode
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
              title={`${label} Layout`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs">{label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
