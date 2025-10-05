'use client';

import { useState } from 'react';
import { Plus, Grid3x3, RotateCcw, Download, Zap } from 'lucide-react';

interface QuickAction {
  icon: typeof Plus;
  label: string;
  action: () => void;
  color: string;
}

interface QuickActionsOrbProps {
  onAddWidget?: () => void;
  onArrangeGrid?: () => void;
  onResetLayout?: () => void;
  onExportData?: () => void;
  isVisible?: boolean;
}

export default function QuickActionsOrb({
  onAddWidget,
  onArrangeGrid,
  onResetLayout,
  onExportData,
  isVisible = true
}: QuickActionsOrbProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions: QuickAction[] = [
    {
      icon: Plus,
      label: 'Add Widget',
      action: () => onAddWidget?.(),
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: Grid3x3,
      label: 'Arrange Grid',
      action: () => onArrangeGrid?.(),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: RotateCcw,
      label: 'Reset Layout',
      action: () => onResetLayout?.(),
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Download,
      label: 'Export Data',
      action: () => onExportData?.(),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Action Buttons (Radial Menu) */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-fadeIn">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const delay = index * 50;

            return (
              <div
                key={index}
                className="flex items-center justify-end group"
                style={{ animationDelay: `${delay}ms` }}
              >
                {/* Label */}
                <div className="mr-3 px-3 py-2 bg-zinc-900/95 backdrop-blur-xl rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-sm text-white">{action.label}</span>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleActionClick(action)}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} shadow-lg hover:scale-110 transition-transform flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-all duration-300 flex items-center justify-center group ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        {isExpanded ? (
          <Plus className="w-7 h-7 text-white transition-transform" />
        ) : (
          <Zap className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 blur-xl opacity-30 -z-10 animate-pulse" />
    </div>
  );
}
