'use client';

import { useEffect, useState } from 'react';

interface ChronaLogoProps {
  className?: string;
  animate?: boolean;
  size?: number;
}

export default function ChronaLogo({ className = '', animate = true, size = 120 }: ChronaLogoProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(true);
    }
  }, [animate]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-2xl transition-all duration-1000 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`} />

      {/* Main logo circle */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl transition-all duration-1000 ${
        isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-80 rotate-45'
      }`}>
        {/* Letter C */}
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 100 100"
          className="text-white"
        >
          {/* Animated C */}
          <path
            d="M70 25 A 25 25 0 1 0 70 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={`transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              strokeDasharray: animate ? '200' : 'none',
              strokeDashoffset: animate && !isVisible ? '200' : '0',
              transition: 'stroke-dashoffset 1s ease-out 0.5s, opacity 1s ease-out 0.5s'
            }}
          />

          {/* Inner dot for cosmic effect */}
          <circle
            cx="50"
            cy="50"
            r="4"
            fill="currentColor"
            className={`transition-all duration-500 delay-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          />
        </svg>
      </div>

      {/* Orbital ring */}
      <div className={`absolute inset-[-8px] rounded-full border-2 border-purple-500/30 transition-all duration-1000 delay-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
      }`} />

      {/* Outer orbital ring */}
      <div className={`absolute inset-[-16px] rounded-full border border-blue-500/20 transition-all duration-1000 delay-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-125'
      }`} />
    </div>
  );
}
