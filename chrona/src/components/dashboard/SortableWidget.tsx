'use client';

import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SortableWidgetProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  glowColor?: 'purple' | 'blue' | 'red' | 'green';
  className?: string;
}

export default function SortableWidget({
  id,
  title,
  icon,
  children,
  glowColor = 'purple',
  className = ''
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl backdrop-blur-xl border border-white/10 flex flex-col
        w-full h-[420px]
        ${isDragging ? 'scale-105 rotate-1 z-50 opacity-80' : 'scale-100 opacity-100'}
        cursor-grab active:cursor-grabbing
        ${glowColors[glowColor]}
        ${hoverGlowColors[glowColor]}
        animate-float
        relative
        ${className}
      `}
      style={{
        ...style,
        background: 'rgba(30, 30, 45, 0.8)',
        transition: isDragging ? transition : 'all 0.3s ease-out',
      }}
      suppressHydrationWarning
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-purple-400">{icon}</div>}
          <h3 className="font-semibold text-white text-lg">{title}</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </div>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-2 right-2 text-xs text-white/30 select-none pointer-events-none">
        Drag to reorder
      </div>
    </div>
  );
}