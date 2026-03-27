'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

const WALLPAPERS = [
  { id: 'default', label: 'Default', color: '#2c001e' },
  { id: 'jammy', label: 'Jammy', color: '#e95420' },
  { id: 'noble', label: 'Noble', color: '#77216f' },
  { id: 'teal', label: 'Teal', color: '#0e8a7b' },
];

const SETTINGS_SECTIONS = [
  { id: 'background', label: 'Background', icon: '🖼️' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { id: 'sound', label: 'Sound', icon: '🔊' },
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'power', label: 'Power', icon: '🔋' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
];

export default function LinuxSettings() {
  const [section, setSection] = useState('background');
  const wallpaper = useSimulationStore((s) => s.wallpaper);
  const setWallpaper = useSimulationStore((s) => s.setWallpaper);
  const recordAction = useSimulationStore((s) => s.recordAction);

  return (
    <div className="flex h-full text-sm" style={{ fontFamily: '"Ubuntu", "Cantarell", sans-serif' }}>
      {/* Sidebar */}
      <div className="w-48 shrink-0 bg-[#2d2d2d] border-r border-[#1a1a1a] py-3">
        {SETTINGS_SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs ${
              section === s.id ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
            }`}
            onClick={() => setSection(s.id)}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto bg-[#383838] text-gray-200">
        {section === 'background' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Background</h2>
            <div className="grid grid-cols-4 gap-3">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  className={`aspect-video rounded-lg border-2 transition-all ${
                    wallpaper === w.id ? 'border-[#e95420] ring-2 ring-[#e95420]/40' : 'border-[#555] hover:border-[#777]'
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
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <div className="space-y-3 text-xs">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">🐧</div>
                <div className="font-semibold text-base">SwitchOS Linux</div>
                <div className="text-gray-400">GNOME Simulation Environment</div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-[#2d2d2d] p-3 rounded-lg">
                <span className="text-gray-400">Device Name</span><span>switchos-penguin</span>
                <span className="text-gray-400">OS</span><span>SwitchOS Linux 1.0 (Fun Edition)</span>
                <span className="text-gray-400">Kernel</span><span>Linux 6.1.0-switchos</span>
                <span className="text-gray-400">Desktop</span><span>GNOME (simulated)</span>
                <span className="text-gray-400">Memory</span><span>8 GB</span>
              </div>
            </div>
          </div>
        )}

        {section === 'appearance' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-2">Style</div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg bg-[#2d2d2d] border-2 border-[#e95420] text-xs">Dark</button>
                  <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 border-2 border-transparent text-xs opacity-50">Light</button>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Accent Color</div>
                <div className="flex gap-2">
                  {['#e95420', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border-2 border-transparent hover:border-white/50"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'wifi' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Wi-Fi</h2>
            <div className="flex items-center gap-2 bg-[#2d2d2d] p-3 rounded-lg text-xs">
              <span className="text-green-500 text-lg">●</span>
              <span>Connected to SwitchOS-Network</span>
            </div>
          </div>
        )}

        {section === 'sound' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Sound</h2>
            <p className="text-xs text-gray-400">Sound settings are simulated.</p>
          </div>
        )}

        {section === 'display' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Display</h2>
            <p className="text-xs text-gray-400">Display settings are simulated.</p>
          </div>
        )}

        {section === 'power' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Power</h2>
            <p className="text-xs text-gray-400">Power settings are simulated.</p>
          </div>
        )}

        {section === 'notifications' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <p className="text-xs text-gray-400">Notification settings are simulated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
