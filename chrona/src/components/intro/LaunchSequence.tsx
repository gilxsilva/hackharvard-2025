'use client';

import { ReactNode, useEffect } from 'react';
import { useIntroSequence } from '@/hooks/useIntroSequence';
import ChronaLogo from './ChronaLogo';
import ParticleEffect from './ParticleEffect';

interface LaunchSequenceProps {
  children: ReactNode;
  enabled?: boolean;
}

export default function LaunchSequence({ children, enabled = true }: LaunchSequenceProps) {
  const { phase, isComplete, skip } = useIntroSequence(enabled);

  // If intro is complete or disabled, just show children
  if (isComplete || !enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Intro Overlay */}
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        {/* Skip Button */}
        <button
          onClick={skip}
          className="absolute top-8 right-8 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors border border-white/20 rounded-lg hover:border-white/40"
        >
          Skip <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-xs">ESC</kbd>
        </button>

        {/* Logo Animation */}
        {(phase === 'logo-appear' || phase === 'logo-pulse') && (
          <div className="flex flex-col items-center space-y-8">
            <ChronaLogo
              size={160}
              animate={true}
              className={phase === 'logo-pulse' ? 'animate-breathing' : ''}
            />
          </div>
        )}

        {/* Text Type Animation */}
        {(phase === 'text-type' || phase === 'scatter') && (
          <div className="flex flex-col items-center space-y-8">
            <ChronaLogo size={160} animate={false} className="animate-breathing" />
            <div className="relative h-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-fadeIn">
                CHRONA
              </h1>
              <p className="text-center text-gray-400 mt-2 text-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                Your Cosmic Academic Dashboard
              </p>
            </div>
          </div>
        )}

        {/* Particle Effect */}
        {phase === 'scatter' && <ParticleEffect isActive={true} particleCount={60} />}

        {/* Dashboard Fade In */}
        {phase === 'dashboard-fade' && (
          <div className="absolute inset-0 bg-black animate-fadeOut" />
        )}
      </div>

      {/* Dashboard Content (behind intro) */}
      <div className={phase === 'dashboard-fade' || isComplete ? 'animate-fadeIn' : 'opacity-0'}>
        {children}
      </div>

      {/* ESC Key Handler */}
      <EscapeKeyHandler onEscape={skip} enabled={!isComplete} />
    </>
  );
}

// Helper component for ESC key handling
function EscapeKeyHandler({ onEscape, enabled }: { onEscape: () => void; enabled: boolean }) {
  if (typeof window === 'undefined') return null;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape]);

  return null;
}
