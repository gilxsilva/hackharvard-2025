'use client';

import { ReactNode, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';

interface ZoomableCanvasProps {
  children: ReactNode;
  onScaleChange?: (scale: number) => void;
}

export function ZoomableCanvas({ children, onScaleChange }: ZoomableCanvasProps) {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  const handleZoomChange = (ref: ReactZoomPanPinchRef) => {
    const scale = ref.state.scale;
    setCurrentZoom(scale);
    onScaleChange?.(scale);
  };

  const handleReset = () => {
    transformRef.current?.resetTransform();
  };

  const handleCenter = () => {
    transformRef.current?.centerView(1, 300);
  };

  return (
    <>
      {/* Zoom Controls */}
      <div className="fixed top-24 left-6 z-40 flex flex-col gap-2">
        <div className="bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 p-2">
          <div className="text-xs text-gray-400 mb-2 font-medium text-center">
            {Math.round(currentZoom * 100)}%
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => transformRef.current?.zoomIn(0.3)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Zoom In (Ctrl + +)"
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>

            <button
              onClick={() => transformRef.current?.zoomOut(0.3)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Zoom Out (Ctrl + -)"
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="Reset View (Ctrl + 0)"
            >
              <Maximize2 className="w-4 h-4 text-gray-300" />
            </button>

            <button
              onClick={handleCenter}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg transition-colors"
              title="Center View"
            >
              <Crosshair className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>

        {/* Pan Instructions */}
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-lg border border-blue-500/30 p-3 max-w-[200px]">
          <div className="text-xs text-blue-300 font-medium mb-1">
            🖱️ Canvas Controls
          </div>
          <ul className="text-[10px] text-blue-200/80 space-y-1">
            <li>• Scroll to zoom</li>
            <li>• Click + drag to pan</li>
            <li>• Ctrl+0 to reset</li>
          </ul>
        </div>
      </div>

      {/* Zoomable Canvas */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
        panning={{ velocityDisabled: false }}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        onTransformed={handleZoomChange}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full"
        >
          {children}
        </TransformComponent>
      </TransformWrapper>
    </>
  );
}
