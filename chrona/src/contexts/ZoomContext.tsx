'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useZoom, ZoomController } from '@/hooks/useZoom';

const ZoomContext = createContext<ZoomController | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const zoomController = useZoom();

  return (
    <ZoomContext.Provider value={zoomController}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoomContext() {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoomContext must be used within ZoomProvider');
  }
  return context;
}
