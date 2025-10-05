'use client';

import { useEffect, useState } from 'react';
import { LayoutMode } from '@/utils/layoutAlgorithms';

interface LayoutDebuggerProps {
  currentLayout: LayoutMode;
  widgetCount: number;
}

export function LayoutDebugger({ currentLayout, widgetCount }: LayoutDebuggerProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [layoutName, setLayoutName] = useState(currentLayout);

  useEffect(() => {
    setLayoutName(currentLayout);
    setShowNotification(true);

    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentLayout]);

  const layoutIcons = {
    orbital: '🪐',
    grid: '🔲',
    masonry: '🧱',
    spiral: '🌀'
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
      <div className="bg-purple-500/90 backdrop-blur-xl border border-purple-400/50 rounded-xl px-6 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{layoutIcons[layoutName]}</span>
          <div>
            <div className="text-white font-bold text-sm">
              {layoutName.charAt(0).toUpperCase() + layoutName.slice(1)} Layout
            </div>
            <div className="text-purple-200 text-xs">
              Arranging {widgetCount} widget{widgetCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
