import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const matchesMeta = shortcut.meta ? event.metaKey : !event.metaKey;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    meta: true,
    action: () => {}, // Will be set by consumer
    description: 'Open command palette'
  },
  {
    key: 'g',
    action: () => {},
    description: 'Toggle grid snap'
  },
  {
    key: 'a',
    action: () => {},
    description: 'Auto-arrange widgets'
  },
  {
    key: ' ',
    action: () => {},
    description: 'Toggle AI chat'
  },
  {
    key: '/',
    meta: true,
    action: () => {},
    description: 'Show help'
  }
];
