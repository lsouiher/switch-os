'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

const WALLPAPERS = [
  { id: 'default', label: 'Default', color: '#1a1a2e' },
  { id: 'monterey', label: 'Monterey', color: '#3b82f6' },
  { id: 'ventura', label: 'Ventura', color: '#047857' },
  { id: 'sonoma', label: 'Sonoma', color: '#7c3aed' },
];

const SETTINGS_SECTIONS = [
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️' },
  { id: 'about', label: 'About This Mac', icon: 'ℹ️' },
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'sound', label: 'Sound', icon: '🔊' },
  { id: 'network', label: 'Network', icon: '📶' },
];

export default function SystemSettings() {
  const [section, setSection] = useState('wallpaper');
  const wallpaper = useSimulationStore((s) => s.wallpaper);
  const setWallpaper = useSimulationStore((s) => s.setWallpaper);
  const recordAction = useSimulationStore((s) => s.recordAction);

  return (
    <div className="flex h-full text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-48 shrink-0 bg-gray-50/80 border-r border-gray-200 py-3">
        {SETTINGS_SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs ${
              section === s.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setSection(s.id)}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {section === 'wallpaper' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Wallpaper</h2>
            <div className="grid grid-cols-4 gap-3">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  className={`aspect-video rounded-lg border-2 transition-all ${
                    wallpaper === w.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ background: w.color }}
                  onClick={() => {
                    setWallpaper(w.id);
                    recordAction({
                      type: 'click',
                      target: { elementType: 'settings-wallpaper' },
                      data: { text: w.id },
                    });
                  }}
                >
                  <span className="text-white text-[10px]">{w.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {section === 'about' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">About This Mac</h2>
            <div className="space-y-3 text-xs">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">💻</div>
                <div className="font-semibold text-base">SwitchOS Simulator</div>
                <div className="text-gray-500">macOS Simulation Environment</div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-500">Chip</span><span>Apple M-Simulated</span>
                <span className="text-gray-500">Memory</span><span>8 GB</span>
                <span className="text-gray-500">Serial Number</span><span>SWITCHOS-001</span>
                <span className="text-gray-500">macOS</span><span>SwitchOS 1.0</span>
              </div>
            </div>
          </div>
        )}

        {section === 'display' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Display</h2>
            <p className="text-xs text-gray-500">Display settings are simulated.</p>
          </div>
        )}

        {section === 'sound' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Sound</h2>
            <p className="text-xs text-gray-500">Sound settings are simulated.</p>
          </div>
        )}

        {section === 'network' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Network</h2>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg text-xs">
              <span className="text-green-500 text-lg">●</span>
              <span>Wi-Fi: Connected to SwitchOS-Network</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
