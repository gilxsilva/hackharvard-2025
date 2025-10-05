'use client';

import { ReactNode, useEffect } from 'react';
import SpaceBackground from './SpaceBackground';
import CentralHub from './CentralHub';
import { useZoom } from '@/hooks/useZoom';

interface DashboardCanvasProps {
  children: ReactNode;
}

export default function DashboardCanvas({ children }: DashboardCanvasProps) {
  const { zoomState, focusedWidgetId } = useZoom();

  // Handle ESC key to zoom out
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoomState === 'focused') {
        // Trigger zoom out through parent context if needed
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [zoomState]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#0a0a14' }}>
      {/* Space Background */}
      <SpaceBackground />

      {/* Central AI Hub */}
      <CentralHub />

      {/* Widgets */}
      <div className="relative w-full h-full">
        {children}
      </div>

      {/* Zoom Overlay */}
      {zoomState === 'focused' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300" />
      )}

      {/* Instructions Overlay (only show when not zoomed) */}
      {zoomState === 'overview' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-6 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs text-white/70">Drag to move widgets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-white/70">Double-click to expand</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-white/70">Click center for AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
