import { WidgetPosition } from './layoutAlgorithms';

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  padding: number;
}

/**
 * Calculate the bounding box for a set of widget positions
 */
export function calculateLayoutBounds(
  positions: WidgetPosition[],
  widgetWidth: number = 380,
  widgetHeight: number = 420
): LayoutBounds {
  if (positions.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
    };
  }

  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x + widgetWidth));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y + widgetHeight));

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculate optimal scale factor to fit layout within viewport
 */
export function calculateOptimalScale(
  layoutBounds: LayoutBounds,
  viewport: ViewportInfo
): number {
  const availableWidth = viewport.width - viewport.padding * 2;
  const availableHeight = viewport.height - viewport.padding * 2;

  const scaleX = availableWidth / layoutBounds.width;
  const scaleY = availableHeight / layoutBounds.height;

  // Use the smaller scale to ensure everything fits
  // Cap minimum at 0.3 (30%) to keep widgets readable
  // Cap maximum at 1.0 (100%) to avoid enlarging
  return Math.max(0.3, Math.min(1.0, scaleX, scaleY));
}

/**
 * Check if layout exceeds viewport bounds
 */
export function doesLayoutOverflow(
  layoutBounds: LayoutBounds,
  viewport: ViewportInfo
): boolean {
  return (
    layoutBounds.width > viewport.width - viewport.padding * 2 ||
    layoutBounds.height > viewport.height - viewport.padding * 2
  );
}

/**
 * Center positions within viewport
 */
export function centerLayout(
  positions: WidgetPosition[],
  layoutBounds: LayoutBounds,
  viewport: ViewportInfo
): WidgetPosition[] {
  const offsetX = (viewport.width - layoutBounds.width) / 2 - layoutBounds.minX;
  const offsetY = (viewport.height - layoutBounds.height) / 2 - layoutBounds.minY;

  return positions.map(pos => ({
    ...pos,
    x: pos.x + offsetX,
    y: pos.y + offsetY,
  }));
}

/**
 * Scale positions from center
 */
export function scaleLayout(
  positions: WidgetPosition[],
  scale: number,
  centerX: number,
  centerY: number
): WidgetPosition[] {
  return positions.map(pos => ({
    ...pos,
    x: centerX + (pos.x - centerX) * scale,
    y: centerY + (pos.y - centerY) * scale,
  }));
}
