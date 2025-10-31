'use client';

import { ReactNode, useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragMoveEvent
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

export interface Position {
  x: number;
  y: number;
}

interface DnDContextProviderProps {
  children: ReactNode;
  onDragEnd?: (id: string, position: Position) => void;
  onDragStart?: (id: string) => void;
  snapToGrid?: (position: Position) => Position;
}

export function DnDContextProvider({ 
  children, 
  onDragEnd, 
  onDragStart,
  snapToGrid 
}: DnDContextProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState<Position>({ x: 0, y: 0 });

  // Configure sensors for better touch and mouse support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setDragDelta({ x: 0, y: 0 });
    onDragStart?.(active.id as string);
  }, [onDragStart]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { delta } = event;
    setDragDelta(delta);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (active && delta) {
      const widgetData = active.data.current;
      if (widgetData?.position) {
        // Calculate viewport bounds for widget containment
        const maxX = typeof window !== 'undefined' ? window.innerWidth - 380 : 1200; // widget width is 380px
        const maxY = typeof window !== 'undefined' ? window.innerHeight - 420 : 800; // widget height is 420px
        
        const newPosition = {
          x: Math.max(0, Math.min(maxX, widgetData.position.x + delta.x)),
          y: Math.max(0, Math.min(maxY, widgetData.position.y + delta.y))
        };

        // Apply grid snapping if provided
        const finalPosition = snapToGrid ? snapToGrid(newPosition) : newPosition;
        
        onDragEnd?.(active.id as string, finalPosition);
      }
    }

    setActiveId(null);
    setDragDelta({ x: 0, y: 0 });
  }, [onDragEnd, snapToGrid]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeId ? (
          <div className="pointer-events-none opacity-90 scale-105 rotate-1">
            <div className="w-96 h-96 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-cosmic-glow">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <h3 className="font-semibold text-white text-lg">
                    {activeId.charAt(0).toUpperCase() + activeId.slice(1)}
                  </h3>
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="text-white/60 text-sm">Moving widget...</div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}