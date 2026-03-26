'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

interface TaskbarItem {
  id: string;
  appId: string;
  label: string;
  icon: string;
}

const PINNED_APPS: TaskbarItem[] = [
  { id: 'tb-fileexplorer', appId: 'fileexplorer', label: 'File Explorer', icon: '📁' },
  { id: 'tb-notepad', appId: 'notepad', label: 'Notepad', icon: '📝' },
  { id: 'tb-powershell', appId: 'powershell', label: 'PowerShell', icon: '💠' },
  { id: 'tb-cmd', appId: 'cmd', label: 'Command Prompt', icon: '⬛' },
  { id: 'tb-winsettings', appId: 'winsettings', label: 'Settings', icon: '⚙️' },
  { id: 'tb-edge', appId: 'edge', label: 'Microsoft Edge', icon: '🌐' },
];

export default function Taskbar({ onStartClick, startMenuOpen }: { onStartClick: () => void; startMenuOpen: boolean }) {
  const launchApp = useSimulationStore((s) => s.launchApp);
  const runningApps = useSimulationStore((s) => s.runningApps);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const toggleSpotlight = useSimulationStore((s) => s.toggleSpotlight);

  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const date = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  const handleAppClick = (item: TaskbarItem) => {
    recordAction({ type: 'click', target: { elementType: 'taskbar-app', elementId: item.appId } });
    launchApp(item.appId);
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-12 flex items-center px-2 z-[9998]"
      style={{
        background: 'rgba(32, 32, 32, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Start button */}
      <button
        onClick={onStartClick}
        className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
          startMenuOpen ? 'bg-white/15' : 'hover:bg-white/10'
        }`}
        aria-label="Start"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
          <rect x="0" y="0" width="7" height="7" rx="1" />
          <rect x="9" y="0" width="7" height="7" rx="1" />
          <rect x="0" y="9" width="7" height="7" rx="1" />
          <rect x="9" y="9" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Search */}
      <button
        onClick={() => {
          recordAction({ type: 'click', target: { elementType: 'taskbar-search' } });
          toggleSpotlight();
        }}
        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors ml-1"
        aria-label="Search"
      >
        <span className="text-white text-sm">🔍</span>
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-white/15 mx-2" />

      {/* Pinned apps */}
      <div className="flex items-center gap-0.5">
        {PINNED_APPS.map((item) => {
          const isRunning = runningApps.has(item.appId);
          return (
            <button
              key={item.id}
              onClick={() => handleAppClick(item)}
              className="relative w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors group"
              aria-label={item.label}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              {isRunning && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* System tray */}
      <div className="flex items-center gap-1 text-white text-[11px]">
        <span className="px-1">🔊</span>
        <span className="px-1">📶</span>
        <span className="px-1">🔋</span>
        <div className="flex flex-col items-end px-2 py-1 rounded hover:bg-white/10 cursor-default">
          <span>{time}</span>
          <span className="text-[10px] text-white/70">{date}</span>
        </div>
      </div>
    </div>
  );
}
