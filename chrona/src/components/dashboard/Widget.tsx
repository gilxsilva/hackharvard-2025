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
  const prevPositionRef = useRef<Position>(initialPosition);

  // Prevent canvas panning when dragging widget
  const handleWidgetMouseDown = (e: React.MouseEvent) => {
    if (isDraggable && !isZoomed) {
      e.stopPropagation(); // Stop event from reaching TransformWrapper
      handleMouseDown(e);
    }
  };

  // Notify parent of position changes only when position actually changes
  useEffect(() => {
    if (onPositionChange &&
        (prevPositionRef.current.x !== position.x || prevPositionRef.current.y !== position.y)) {
      onPositionChange(position);
      prevPositionRef.current = position;
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
      ref={widgetRef}
      className={`
        fixed rounded-2xl backdrop-blur-xl border border-white/10 flex flex-col
        ${isZoomed ? 'inset-0 m-auto max-w-6xl max-h-[90vh] z-50' : ''}
        ${isDragging ? 'scale-105 rotate-1' : 'scale-100'}
        ${isDraggable && !isZoomed ? 'cursor-grab active:cursor-grabbing' : ''}
        ${glowColors[glowColor]}
        ${!isZoomed ? hoverGlowColors[glowColor] : ''}
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
        // Smooth transitions for layout changes (but not while dragging)
        transition: isDragging ? 'none' : 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s ease-out',
      }}
      onMouseDown={handleWidgetMouseDown}
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
