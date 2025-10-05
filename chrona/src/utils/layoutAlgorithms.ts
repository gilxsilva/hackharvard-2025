export interface WidgetPosition {
  id: string;
  x: number;
  y: number;
}

export type LayoutMode = 'orbital' | 'masonry' | 'spiral' | 'grid';

interface LayoutParams {
  centerX: number;
  centerY: number;
  widgetWidth: number;
  widgetHeight: number;
}

/**
 * Orbital Layout - Arranges widgets in a circle around the center
 */
export function orbitalLayout(
  widgetIds: string[],
  params: LayoutParams
): WidgetPosition[] {
  const { centerX, centerY, widgetWidth, widgetHeight } = params;
  const radius = Math.min(centerX, centerY) * 0.5;

  return widgetIds.map((id, index) => {
    const angle = (index * 2 * Math.PI) / widgetIds.length - Math.PI / 2;
    return {
      id,
      x: centerX + radius * Math.cos(angle) - widgetWidth / 2,
      y: centerY + radius * Math.sin(angle) - widgetHeight / 2
    };
  });
}

/**
 * Masonry Layout - Pinterest-style stacked columns
 */
export function masonryLayout(
  widgetIds: string[],
  params: LayoutParams
): WidgetPosition[] {
  const { centerX, widgetWidth, widgetHeight } = params;
  const columns = 3;
  const gap = 20;
  const columnHeights = new Array(columns).fill(100);

  const startX = centerX - ((widgetWidth + gap) * columns) / 2;

  return widgetIds.map((id) => {
    // Find shortest column
    const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
    const x = startX + shortestCol * (widgetWidth + gap);
    const y = columnHeights[shortestCol];

    // Update column height
    columnHeights[shortestCol] += widgetHeight + gap;

    return { id, x, y };
  });
}

/**
 * Fractal Spiral Layout - Logarithmic spiral arrangement
 */
export function spiralLayout(
  widgetIds: string[],
  params: LayoutParams
): WidgetPosition[] {
  const { centerX, centerY, widgetWidth, widgetHeight } = params;
  const a = 10; // Spiral tightness
  const b = 0.3; // Spiral growth rate

  return widgetIds.map((id, index) => {
    const theta = index * 0.8;
    const r = a + b * theta;
    const x = centerX + r * Math.cos(theta * 50) - widgetWidth / 2;
    const y = centerY + r * Math.sin(theta * 50) - widgetHeight / 2;

    return { id, x, y };
  });
}

/**
 * Grid of Thirds Layout - Golden ratio grid placement
 */
export function gridLayout(
  widgetIds: string[],
  params: LayoutParams
): WidgetPosition[] {
  const { centerX, centerY, widgetWidth, widgetHeight } = params;
  const cols = Math.ceil(Math.sqrt(widgetIds.length));
  const gap = 40;

  const gridWidth = cols * (widgetWidth + gap) - gap;
  const startX = centerX - gridWidth / 2;
  const startY = 100;

  return widgetIds.map((id, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      id,
      x: startX + col * (widgetWidth + gap),
      y: startY + row * (widgetHeight + gap)
    };
  });
}

/**
 * Main layout orchestrator
 */
export function applyLayout(
  widgetIds: string[],
  mode: LayoutMode,
  params: LayoutParams
): WidgetPosition[] {
  switch (mode) {
    case 'orbital':
      return orbitalLayout(widgetIds, params);
    case 'masonry':
      return masonryLayout(widgetIds, params);
    case 'spiral':
      return spiralLayout(widgetIds, params);
    case 'grid':
      return gridLayout(widgetIds, params);
    default:
      return orbitalLayout(widgetIds, params);
  }
}
