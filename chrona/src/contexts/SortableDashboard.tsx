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
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

interface SortableDashboardProps {
  children: ReactNode;
  items: string[];
  onItemsChange: (items: string[]) => void;
}

export function SortableDashboard({ children, items, onItemsChange }: SortableDashboardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for better touch and mouse support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Very responsive
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      
      onItemsChange(arrayMove(items, oldIndex, newIndex));
    }

    setActiveId(null);
  }, [items, onItemsChange]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="opacity-90 scale-105 rotate-1">
            <div className="w-96 h-96 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-cosmic-glow">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <h3 className="font-semibold text-white text-lg">
                    {activeId.charAt(0).toUpperCase() + activeId.slice(1)}
                  </h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-white/40">
                  <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}