'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;
  isWidgetManagerOpen: boolean;
  isHelpOpen: boolean;
  showCalendar: boolean;
}

interface NavigationContextType extends NavigationState {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openWidgetManager: () => void;
  closeWidgetManager: () => void;
  toggleCalendar: () => void;
  openHelp: () => void;
  closeHelp: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    isCommandPaletteOpen: false,
    isSettingsOpen: false,
    isWidgetManagerOpen: false,
    isHelpOpen: false,
    showCalendar: true
  });

  const openCommandPalette = () => setState((s) => ({ ...s, isCommandPaletteOpen: true }));
  const closeCommandPalette = () => setState((s) => ({ ...s, isCommandPaletteOpen: false }));
  const toggleCommandPalette = () => setState((s) => ({ ...s, isCommandPaletteOpen: !s.isCommandPaletteOpen }));

  const openSettings = () => setState((s) => ({ ...s, isSettingsOpen: true }));
  const closeSettings = () => setState((s) => ({ ...s, isSettingsOpen: false }));

  const openWidgetManager = () => setState((s) => ({ ...s, isWidgetManagerOpen: true }));
  const closeWidgetManager = () => setState((s) => ({ ...s, isWidgetManagerOpen: false }));

  const toggleCalendar = () => setState((s) => ({ ...s, showCalendar: !s.showCalendar }));

  const openHelp = () => setState((s) => ({ ...s, isHelpOpen: true }));
  const closeHelp = () => setState((s) => ({ ...s, isHelpOpen: false }));

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        openCommandPalette,
        closeCommandPalette,
        toggleCommandPalette,
        openSettings,
        closeSettings,
        openWidgetManager,
        closeWidgetManager,
        toggleCalendar,
        openHelp,
        closeHelp
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
