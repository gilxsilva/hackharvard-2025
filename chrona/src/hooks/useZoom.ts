import { useState, useCallback } from 'react';

export type ZoomState = 'overview' | 'focused';

export interface ZoomController {
  zoomState: ZoomState;
  focusedWidgetId: string | null;
  zoomIn: (widgetId: string) => void;
  zoomOut: () => void;
  toggleZoom: (widgetId: string) => void;
  isFocused: (widgetId: string) => boolean;
}

export function useZoom(): ZoomController {
  const [zoomState, setZoomState] = useState<ZoomState>('overview');
  const [focusedWidgetId, setFocusedWidgetId] = useState<string | null>(null);

  const zoomIn = useCallback((widgetId: string) => {
    setZoomState('focused');
    setFocusedWidgetId(widgetId);
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState('overview');
    setFocusedWidgetId(null);
  }, []);

  const toggleZoom = useCallback((widgetId: string) => {
    if (zoomState === 'focused' && focusedWidgetId === widgetId) {
      zoomOut();
    } else {
      zoomIn(widgetId);
    }
  }, [zoomState, focusedWidgetId, zoomIn, zoomOut]);

  const isFocused = useCallback((widgetId: string) => {
    return zoomState === 'focused' && focusedWidgetId === widgetId;
  }, [zoomState, focusedWidgetId]);

  return {
    zoomState,
    focusedWidgetId,
    zoomIn,
    zoomOut,
    toggleZoom,
    isFocused
  };
}
