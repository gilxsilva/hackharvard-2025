'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, Grid3x3, Calendar, Bell, HelpCircle, Bot, Layout } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface CommandBarProps {
  onOpenSettings?: () => void;
  onOpenWidgetManager?: () => void;
  onToggleCalendar?: () => void;
  onOpenHelp?: () => void;
  onToggleAI?: () => void;
}

export default function CommandBar({
  onOpenSettings,
  onOpenWidgetManager,
  onToggleCalendar,
  onOpenHelp,
  onToggleAI
}: CommandBarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Detect current route to show appropriate navigation
  const isOnCalendar = typeof window !== 'undefined' && window.location.pathname === '/calendar';

  const navItems = [
    { icon: User, label: 'Profile', action: () => setShowProfileMenu(!showProfileMenu) },
    { icon: Bot, label: 'AI Assistant', action: onToggleAI },
    ...(onOpenWidgetManager && !isOnCalendar ? [{ icon: Layout, label: 'Customize Widgets', action: onOpenWidgetManager }] : []),
    { 
      icon: Calendar, 
      label: isOnCalendar ? 'Dashboard' : 'Calendar', 
      action: () => router.push(isOnCalendar ? '/dashboard' : '/calendar')
    },
  ];

  return (
    <>
      {/* Command Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-purple-500 to-cosmic-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold">Chrona</span>
            </div>

            {/* Center: Navigation Icons */}
            <div className="flex items-center space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                    title={item.label}
                  >
                    <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                    {/* Tooltip */}
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: User Info */}
            <div className="flex items-center space-x-3">
              {session?.user ? (
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <span>{session.user.name?.split(' ')[0]}</span>
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt="User"
                      className="w-7 h-7 rounded-full border-2 border-purple-500"
                    />
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Guest</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      {showProfileMenu && (
        <div className="fixed top-16 right-6 w-64 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
          {session?.user && (
            <>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt="User"
                      className="w-12 h-12 rounded-full border-2 border-purple-500"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{session.user.name}</div>
                    <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
}
