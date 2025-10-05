'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useDragAndDrop, Position, SnapFunction } from '@/hooks/useDragAndDrop';

export interface WidgetProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  initialPosition: Position;
  glowColor?: 'purple' | 'blue' | 'red' | 'green';
  isZoomed?: boolean;
  isDraggable?: boolean;
  onDoubleClick?: () => void;
  onPositionChange?: (position: Position) => void;
  snapFunction?: SnapFunction;
  className?: string;
}

export default function Widget({
  id,
  title,
  icon,
  children,
  initialPosition,
  glowColor = 'purple',
  isZoomed = false,
  isDraggable = true,
  onDoubleClick,
  onPositionChange,
  snapFunction,
  className = ''
}: WidgetProps) {
  const { position, isDragging, handleMouseDown, handleMouseMove, handleMouseUp, setPosition } = useDragAndDrop(initialPosition, snapFunction);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Notify parent of position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(position);
    }
  }, [position, onPositionChange]);

  // Handle global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const glowColors = {
    purple: 'shadow-[0_0_30px_rgba(139,92,246,0.5)]',
    blue: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    red: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]',
    green: 'shadow-[0_0_30px_rgba(16,185,129,0.5)]'
  };

  const hoverGlow = {
    purple: 'hover:shadow-[0_0_50px_rgba(139,92,246,0.7)]',
    blue: 'hover:shadow-[0_0_50px_rgba(59,130,246,0.7)]',
    red: 'hover:shadow-[0_0_50px_rgba(239,68,68,0.7)]',
    green: 'hover:shadow-[0_0_50px_rgba(16,185,129,0.7)]'
  };

  return (
    <div
      ref={widgetRef}
      className={`
        fixed rounded-2xl backdrop-blur-xl border border-white/10
        transition-all duration-300 ease-out
        ${isZoomed ? 'inset-0 m-auto max-w-6xl max-h-[90vh] z-50' : ''}
        ${isDragging ? 'scale-105 rotate-1' : 'scale-100'}
        ${isDraggable && !isZoomed ? 'cursor-grab active:cursor-grabbing' : ''}
        ${glowColors[glowColor]}
        ${!isZoomed ? hoverGlow[glowColor] : ''}
        ${!isZoomed ? 'animate-float' : ''}
        ${className}
      `}
      style={{
        left: isZoomed ? '50%' : `${position.x}px`,
        top: isZoomed ? '50%' : `${position.y}px`,
        transform: isZoomed ? 'translate(-50%, -50%)' : 'none',
        width: isZoomed ? 'auto' : '380px',
        minHeight: isZoomed ? '600px' : '420px',
        background: 'rgba(30, 30, 45, 0.8)',
        zIndex: isDragging ? 100 : isZoomed ? 50 : 10,
      }}
      onMouseDown={isDraggable && !isZoomed ? handleMouseDown : undefined}
      onDoubleClick={onDoubleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-purple-400">{icon}</div>}
          <h3 className="font-semibold text-white text-lg">{title}</h3>
        </div>
        {!isZoomed && (
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${isZoomed ? 'overflow-y-auto max-h-[calc(90vh-80px)]' : 'overflow-y-auto max-h-[340px]'}`}>
        {children}
      </div>

      {/* Resize hint */}
      {!isZoomed && (
        <div className="absolute bottom-2 right-2 text-xs text-white/30 select-none">
          Double-click to expand
        </div>
      )}
    </div>
  );
}
