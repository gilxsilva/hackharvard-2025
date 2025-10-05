'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface ParticleEffectProps {
  isActive: boolean;
  particleCount?: number;
}

export default function ParticleEffect({ isActive, particleCount = 50 }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles from center
    const createParticles = () => {
      const particles: Particle[] = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const colors = ['#8b5cf6', '#3b82f6', '#a855f7', '#60a5fa'];

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 3;

        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 3 + 1,
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      return particles;
    };

    if (isActive && particlesRef.current.length === 0) {
      particlesRef.current = createParticles();
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Fade out
        particle.opacity -= 0.01;

        // Draw particle
        if (particle.opacity > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;
          ctx.fill();

          // Add glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = particle.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        } else {
          // Remove dead particles
          particlesRef.current.splice(index, 1);
        }
      });

      if (isActive && particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isActive) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[110]"
    />
  );
}
