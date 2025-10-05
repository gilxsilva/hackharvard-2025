import { useState, useCallback } from 'react';

export interface GridConfig {
  cellSize: number;
  enabled: boolean;
  showGuides: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
}

const DEFAULT_CELL_SIZE = 40; // px
const SNAP_THRESHOLD = 20; // px - how close to snap

export function useGridSnap(initialEnabled = false) {
  const [config, setConfig] = useState<GridConfig>({
    cellSize: DEFAULT_CELL_SIZE,
    enabled: initialEnabled,
    showGuides: false
  });

  const snapToGrid = useCallback((position: Position): SnapResult => {
    if (!config.enabled) {
      return { ...position, snappedX: false, snappedY: false };
    }

    const { cellSize } = config;

    // Calculate nearest grid cell
    const nearestX = Math.round(position.x / cellSize) * cellSize;
    const nearestY = Math.round(position.y / cellSize) * cellSize;

    // Check if within snap threshold
    const snapX = Math.abs(position.x - nearestX) < SNAP_THRESHOLD;
    const snapY = Math.abs(position.y - nearestY) < SNAP_THRESHOLD;

    return {
      x: snapX ? nearestX : position.x,
      y: snapY ? nearestY : position.y,
      snappedX: snapX,
      snappedY: snapY
    };
  }, [config]);

  const toggleGridSnap = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const toggleGuides = useCallback(() => {
    setConfig(prev => ({ ...prev, showGuides: !prev.showGuides }));
  }, []);

  const setCellSize = useCallback((size: number) => {
    setConfig(prev => ({ ...prev, cellSize: size }));
  }, []);

  return {
    config,
    snapToGrid,
    toggleGridSnap,
    toggleGuides,
    setCellSize,
    isEnabled: config.enabled,
    showGuides: config.showGuides
  };
}
