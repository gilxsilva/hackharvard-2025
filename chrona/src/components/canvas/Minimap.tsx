'use client';

import { useMemo } from 'react';
import { LayoutMode } from '@/utils/layoutAlgorithms';

interface MinimapProps {
  widgetPositions: Array<{ id: string; x: number; y: number }>;
  currentLayout: LayoutMode;
  viewportWidth: number;
  viewportHeight: number;
  scale: number;
  onTeleport?: (x: number, y: number) => void;
}

export function Minimap({
  widgetPositions,
  currentLayout,
  viewportWidth,
  viewportHeight,
  scale,
  onTeleport
}: MinimapProps) {
  // Calculate minimap scale and bounds
  const minimapData = useMemo(() => {
    if (widgetPositions.length === 0) {
      return {
        minX: 0,
        maxX: viewportWidth,
        minY: 0,
        maxY: viewportHeight,
        width: viewportWidth,
        height: viewportHeight,
        scale: 0.1
      };
    }

    const minX = Math.min(...widgetPositions.map(p => p.x));
    const maxX = Math.max(...widgetPositions.map(p => p.x + 380));
    const minY = Math.min(...widgetPositions.map(p => p.y));
    const maxY = Math.max(...widgetPositions.map(p => p.y + 420));

    const width = maxX - minX;
    const height = maxY - minY;

    // Minimap is 200x150px
    const scaleX = 180 / width;
    const scaleY = 130 / height;
    const minimapScale = Math.min(scaleX, scaleY);

    return { minX, maxX, minY, maxY, width, height, scale: minimapScale };
  }, [widgetPositions, viewportWidth, viewportHeight]);

  const layoutEmoji = {
    orbital: '🪐',
    grid: '🔲',
    masonry: '🧱',
    spiral: '🌀'
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{layoutEmoji[currentLayout]}</span>
            <span className="text-xs font-medium text-gray-400">
              {currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)}
            </span>
          </div>
          <span className="text-[10px] text-gray-500">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Minimap Canvas */}
        <div
          className="relative bg-black/30 rounded-lg border border-white/5 overflow-hidden cursor-crosshair"
          style={{ width: '200px', height: '150px' }}
          onClick={(e) => {
            if (onTeleport) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / minimapData.scale + minimapData.minX;
              const y = (e.clientY - rect.top) / minimapData.scale + minimapData.minY;
              onTeleport(x, y);
            }
          }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Widget dots */}
          {widgetPositions.map((pos) => (
            <div
              key={pos.id}
              className="absolute bg-purple-400 rounded-sm shadow-lg"
              style={{
                left: `${(pos.x - minimapData.minX) * minimapData.scale}px`,
                top: `${(pos.y - minimapData.minY) * minimapData.scale}px`,
                width: `${380 * minimapData.scale}px`,
                height: `${420 * minimapData.scale}px`,
                boxShadow: '0 0 6px rgba(139,92,246,0.8)'
              }}
            />
          ))}

          {/* Viewport indicator */}
          <div
            className="absolute border-2 border-blue-400 rounded pointer-events-none"
            style={{
              left: `${(0 - minimapData.minX) * minimapData.scale}px`,
              top: `${(0 - minimapData.minY) * minimapData.scale}px`,
              width: `${viewportWidth * minimapData.scale / scale}px`,
              height: `${viewportHeight * minimapData.scale / scale}px`,
              boxShadow: '0 0 10px rgba(59,130,246,0.5)'
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-2 text-[10px] text-gray-500 text-center">
          {widgetPositions.length} widget{widgetPositions.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
