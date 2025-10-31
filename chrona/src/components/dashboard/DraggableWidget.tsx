'use client';

import { useEffect, ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface Position {
  x: number;
  y: number;
}

export interface DraggableWidgetProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  position: Position;
  glowColor?: 'purple' | 'blue' | 'red' | 'green';
  isZoomed?: boolean;
  isDraggable?: boolean;
  onDoubleClick?: () => void;
  className?: string;
}

export default function DraggableWidget({
  id,
  title,
  icon,
  children,
  position,
  glowColor = 'purple',
  isZoomed = false,
  isDraggable = true,
  onDoubleClick,
  className = ''
}: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id,
    disabled: !isDraggable || isZoomed,
    data: {
      type: 'widget',
      position
    }
  });

  // Handle ESC key to close expanded widget
  useEffect(() => {
    if (isZoomed && onDoubleClick) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onDoubleClick();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isZoomed, onDoubleClick]);

  const glowColors = {
    purple: 'shadow-widget-glow-purple',
    blue: 'shadow-widget-glow-blue',
    red: 'shadow-widget-glow-red',
    green: 'shadow-widget-glow-green'
  };

  const hoverGlowColors = {
    purple: 'hover:shadow-cosmic-glow-hover',
    blue: 'hover:shadow-cosmic-glow-hover',
    red: 'hover:shadow-cosmic-glow-hover',
    green: 'hover:shadow-cosmic-glow-hover'
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        absolute rounded-2xl backdrop-blur-xl border border-white/10 flex flex-col
        ${isDragging ? 'scale-[1.02] z-[100] opacity-80' : 'scale-100 opacity-100'}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${glowColors[glowColor]}
        ${hoverGlowColors[glowColor]}
        animate-float
        ${className}
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: CSS.Transform.toString(transform),
        width: '380px',
        minHeight: '420px',
        background: 'rgba(30, 30, 45, 0.8)',
        zIndex: isDragging ? 100 : 10,
        // Smooth transitions when not dragging
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      }}
      onDoubleClick={onDoubleClick}
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-purple-400">{icon}</div>}
          <h3 className="font-semibold text-white text-lg">{title}</h3>
        </div>
        {!isZoomed && (
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {children}
        </div>
      </div>

      {/* Resize hint */}
      {!isZoomed ? (
        <div className="absolute bottom-2 right-2 text-xs text-white/30 select-none">
          Double-click to expand
        </div>
      ) : (
        <div className="absolute bottom-2 right-2 text-xs text-white/30 select-none">
          Press ESC to close
        </div>
      )}
    </div>
  );
}