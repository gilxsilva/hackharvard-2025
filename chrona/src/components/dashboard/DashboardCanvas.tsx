'use client';

import { ReactNode } from 'react';
import SpaceBackground from './SpaceBackground';
import CentralHub from './CentralHub';
import CommandBar from '../navigation/CommandBar';
import CommandPalette from '../navigation/CommandPalette';
import QuickActionsOrb from '../navigation/QuickActionsOrb';
import { useZoom } from '@/hooks/useZoom';
import { useNavigation } from '@/contexts/NavigationContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface DashboardCanvasProps {
  children: ReactNode;
}

export default function DashboardCanvas({ children }: DashboardCanvasProps) {
  const { zoomState } = useZoom();
  const {
    isCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    openSettings,
    openWidgetManager,
    toggleCalendar,
    openHelp
  } = useNavigation();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      meta: true,
      action: openCommandPalette,
      description: 'Open command palette'
    }
  ]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: '#0a0a14' }}>
      {/* Space Background */}
      <SpaceBackground />

      {/* Command Bar */}
      <CommandBar
        onOpenSettings={openSettings}
        onOpenWidgetManager={openWidgetManager}
        onToggleCalendar={toggleCalendar}
        onOpenHelp={openHelp}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />

      {/* Central AI Hub */}
      <CentralHub />

      {/* Widgets */}
      <div className="relative w-full h-full">
        {children}
      </div>

      {/* Quick Actions Orb */}
      <QuickActionsOrb
        isVisible={zoomState === 'overview'}
        onAddWidget={openWidgetManager}
        onArrangeGrid={() => console.log('Arrange grid')}
        onResetLayout={() => console.log('Reset layout')}
        onExportData={() => console.log('Export data')}
      />

      {/* Zoom Overlay */}
      {zoomState === 'focused' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300" />
      )}

      {/* Instructions Overlay (only show when not zoomed) */}
      {zoomState === 'overview' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-6 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs text-white/70">Drag to move widgets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs text-white/70">Double-click to expand</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-white/70">Press ⌘K for commands</span>
          </div>
        </div>
      )}
    </div>
  );
}
