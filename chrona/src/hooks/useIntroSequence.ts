import { useState, useEffect } from 'react';

export type IntroPhase = 'logo-appear' | 'logo-pulse' | 'text-type' | 'scatter' | 'dashboard-fade' | 'complete';

interface IntroSequenceState {
  phase: IntroPhase;
  isSkipped: boolean;
  isComplete: boolean;
}

export function useIntroSequence(autoStart: boolean = true) {
  const [state, setState] = useState<IntroSequenceState>({
    phase: 'logo-appear',
    isSkipped: false,
    isComplete: false
  });

  const skip = () => {
    setState({
      phase: 'complete',
      isSkipped: true,
      isComplete: true
    });
  };

  useEffect(() => {
    if (!autoStart || state.isSkipped) return;

    const timings = {
      'logo-appear': 1000,      // 0-1s: Logo appears
      'logo-pulse': 1000,       // 1-2s: Logo pulses
      'text-type': 500,         // 2-2.5s: Text types in
      'scatter': 1000,          // 2.5-3.5s: Particles scatter
      'dashboard-fade': 1200,   // 3.5-4.7s: Dashboard fades in (slower)
    } as const;

    const phases: IntroPhase[] = ['logo-appear', 'logo-pulse', 'text-type', 'scatter', 'dashboard-fade'];
    let currentPhaseIndex = 0;

    const advancePhase = () => {
      if (currentPhaseIndex < phases.length) {
        const currentPhase = phases[currentPhaseIndex];
        setState(prev => ({ ...prev, phase: currentPhase }));

        setTimeout(() => {
          currentPhaseIndex++;
          if (currentPhaseIndex < phases.length) {
            advancePhase();
          } else {
            // Mark as complete
            setState({
              phase: 'complete',
              isSkipped: false,
              isComplete: true
            });
          }
        }, timings[currentPhase as keyof typeof timings]);
      }
    };

    advancePhase();
  }, [autoStart, state.isSkipped]);

  return {
    ...state,
    skip
  };
}
