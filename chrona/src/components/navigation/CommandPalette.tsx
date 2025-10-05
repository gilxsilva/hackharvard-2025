'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Grid3x3, Settings, HelpCircle, Sparkles, X } from 'lucide-react';

interface Command {
  id: string;
  name: string;
  description: string;
  icon: typeof Calendar;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: Command[];
}

export default function CommandPalette({ isOpen, onClose, commands = [] }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultCommands: Command[] = [
    {
      id: 'open-settings',
      name: 'Open Settings',
      description: 'Customize your dashboard preferences',
      icon: Settings,
      action: () => console.log('Open settings'),
      keywords: ['settings', 'preferences', 'config']
    },
    {
      id: 'toggle-calendar',
      name: 'Toggle Calendar',
      description: 'Show or hide calendar widget',
      icon: Calendar,
      action: () => console.log('Toggle calendar'),
      keywords: ['calendar', 'schedule', 'events']
    },
    {
      id: 'manage-widgets',
      name: 'Manage Widgets',
      description: 'Add, remove, or rearrange widgets',
      icon: Grid3x3,
      action: () => console.log('Manage widgets'),
      keywords: ['widgets', 'layout', 'arrange']
    },
    {
      id: 'ask-ai',
      name: 'Ask AI Assistant',
      description: 'Get help with your schedule',
      icon: Sparkles,
      action: () => console.log('Open AI'),
      keywords: ['ai', 'assistant', 'help', 'chat']
    },
    {
      id: 'show-help',
      name: 'Show Help',
      description: 'View keyboard shortcuts and tutorials',
      icon: HelpCircle,
      action: () => console.log('Show help'),
      keywords: ['help', 'shortcuts', 'tutorial', 'guide']
    }
  ];

  const allCommands = [...defaultCommands, ...commands];

  // Filter commands based on query
  const filteredCommands = query.trim()
    ? allCommands.filter((cmd) =>
        cmd.name.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some((kw) => kw.includes(query.toLowerCase()))
      )
    : allCommands;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Command Palette */}
      <div className="w-full max-w-2xl mx-4 bg-zinc-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-400">No commands found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center px-4 py-3 transition-colors ${
                      isSelected ? 'bg-purple-600/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                      isSelected ? 'bg-purple-600/30' : 'bg-white/5'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">{command.name}</div>
                      <div className="text-sm text-gray-400">{command.description}</div>
                    </div>
                    {isSelected && (
                      <kbd className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded">↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}
