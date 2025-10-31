'use client';

import { useEffect, useRef } from 'react';

interface GridOverlayProps {
  cellSize: number;
  isVisible: boolean;
  opacity?: number;
}

export default function GridOverlay({
  cellSize,
  isVisible,
  opacity = 0.1
}: GridOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGrid();
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw vertical lines
      for (let x = 0; x < canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = `rgb(139 92 246 / ${opacity})`; // Purple grid
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Highlight major grid lines (every 4 cells)
      ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 2})`;
      ctx.lineWidth = 2;

      for (let x = 0; x < canvas.width; x += cellSize * 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += cellSize * 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [cellSize, isVisible, opacity]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ opacity: isVisible ? 1 : 0 }}
    />
  );
}
