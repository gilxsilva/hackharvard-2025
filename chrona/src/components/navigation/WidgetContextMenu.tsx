'use client';

import { RefreshCw, Pin, Palette, Maximize2, Trash2 } from 'lucide-react';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface WidgetContextMenuProps {
  position: ContextMenuPosition;
  widgetId: string;
  onClose: () => void;
  onRefresh?: () => void;
  onPin?: () => void;
  onChangeColor?: () => void;
  onResize?: () => void;
  onRemove?: () => void;
}

export default function WidgetContextMenu({
  position,
  widgetId,
  onClose,
  onRefresh,
  onPin,
  onChangeColor,
  onResize,
  onRemove
}: WidgetContextMenuProps) {
  const menuItems = [
    { icon: RefreshCw, label: 'Refresh', action: onRefresh, color: 'text-blue-400' },
    { icon: Pin, label: 'Pin to Grid', action: onPin, color: 'text-purple-400' },
    { icon: Palette, label: 'Change Color', action: onChangeColor, color: 'text-green-400' },
    { icon: Maximize2, label: 'Resize', action: onResize, color: 'text-yellow-400' },
    { icon: Trash2, label: 'Remove', action: onRemove, color: 'text-red-400', divider: true }
  ];

  const handleAction = (action?: () => void) => {
    if (action) action();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90]"
        onClick={onClose}
      />

      {/* Context Menu */}
      <div
        className="fixed z-[91] min-w-[180px] bg-zinc-900/95 backdrop-blur-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
        <div className="py-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index}>
                {item.divider && <div className="h-px bg-white/10 my-1" />}
                <button
                  onClick={() => handleAction(item.action)}
                  className="w-full flex items-center px-3 py-2.5 hover:bg-white/5 transition-colors group"
                  disabled={!item.action}
                >
                  <Icon className={`w-4 h-4 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Widget ID footer */}
        <div className="px-3 py-2 border-t border-white/10 bg-black/20">
          <span className="text-xs text-gray-500">Widget: {widgetId}</span>
        </div>
      </div>
    </>
  );
}
