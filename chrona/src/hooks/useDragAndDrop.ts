import { useState, useRef, useCallback, useEffect } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  position: Position;
  offset: Position;
}

export interface SnapFunction {
  (position: Position): Position;
}

export function useDragAndDrop(
  initialPosition: Position,
  snapFunction?: SnapFunction
) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const velocityRef = useRef<Position>({ x: 0, y: 0 });
  const lastPosRef = useRef<Position>(initialPosition);
  const lastTimeRef = useRef<number>(Date.now());

  // Sync position when initialPosition changes externally (e.g., auto-arrange)
  // Only update if not currently dragging (to avoid fighting user input)
  useEffect(() => {
    if (!isDragging) {
      setPosition(initialPosition);
      lastPosRef.current = initialPosition;
    }
  }, [initialPosition.x, initialPosition.y, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    lastPosRef.current = position;
    lastTimeRef.current = Date.now();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    };

    // Calculate velocity for momentum
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = {
        x: (newPosition.x - lastPosRef.current.x) / dt,
        y: (newPosition.y - lastPosRef.current.y) / dt
      };
    }

    lastPosRef.current = newPosition;
    lastTimeRef.current = now;
    setPosition(newPosition);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Apply snap function on mouse release
    if (snapFunction) {
      const snappedPosition = snapFunction(position);
      setPosition(snappedPosition);
    }

    // Apply momentum (optional)
    // You can add physics-based easing here if desired
  }, [isDragging, snapFunction, position]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setPosition
  };
}
