'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

const WALLPAPERS: Record<string, string> = {
  default: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
  bloom: 'linear-gradient(135deg, #1e3a5f 0%, #0078d4 50%, #00bcf2 100%)',
  flow: 'linear-gradient(135deg, #2d1b69 0%, #6b2fa0 50%, #c239b3 100%)',
  sunrise: 'linear-gradient(135deg, #f5734a 0%, #da2c38 50%, #1e1e2e 100%)',
};

interface SettingsCategory {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: SettingsCategory[] = [
  { id: 'system', label: 'System', icon: '💻' },
  { id: 'personalization', label: 'Personalization', icon: '🎨' },
  { id: 'network', label: 'Network & internet', icon: '🌐' },
  { id: 'apps', label: 'Apps', icon: '📦' },
  { id: 'accounts', label: 'Accounts', icon: '👤' },
  { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  { id: 'privacy', label: 'Privacy & security', icon: '🔒' },
  { id: 'update', label: 'Windows Update', icon: '🔄' },
];

export default function WindowsSettings() {
  const wallpaper = useSimulationStore((s) => s.wallpaper);
  const setWallpaper = useSimulationStore((s) => s.setWallpaper);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const [activeCategory, setActiveCategory] = useState('system');

  const handleWallpaperChange = (wp: string) => {
    setWallpaper(wp);
    recordAction({
      type: 'click',
      target: { elementType: 'settings-wallpaper' },
      data: { text: wp },
    });
  };

  return (
    <div className="flex h-full" style={{ fontFamily: '"Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <div className="w-56 shrink-0 bg-gray-50 border-r border-gray-200 py-4">
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">U</div>
            <div>
              <p className="text-sm font-medium text-gray-800">User</p>
              <p className="text-[10px] text-gray-500">Local account</p>
            </div>
          </div>
        </div>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`w-full text-left px-4 py-2 flex items-center gap-3 text-sm transition-colors ${
              activeCategory === cat.id ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        {activeCategory === 'system' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System</h2>
            <div className="space-y-3">
              <SettingsCard title="Display" description="Brightness, night light, display layout" icon="🖥️" />
              <SettingsCard title="Sound" description="Volume levels, output, input" icon="🔊" />
              <SettingsCard title="Notifications" description="Alerts from apps and system" icon="🔔" />
              <SettingsCard title="Storage" description="Storage usage and configuration" icon="💾" />
              <SettingsCard title="About" description="Device specifications, rename PC" icon="ℹ️" />
            </div>
          </div>
        )}

        {activeCategory === 'personalization' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personalization</h2>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Background</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(WALLPAPERS).map(([key, gradient]) => (
                  <button
                    key={key}
                    onClick={() => handleWallpaperChange(key)}
                    className={`h-16 rounded-lg border-2 transition-all ${
                      wallpaper === key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ background: gradient }}
                    aria-label={`${key} wallpaper`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SettingsCard title="Colors" description="Accent color, transparency effects" icon="🎨" />
              <SettingsCard title="Themes" description="Apply and manage themes" icon="🖼️" />
              <SettingsCard title="Lock screen" description="Lock screen images and apps" icon="🔐" />
              <SettingsCard title="Taskbar" description="Taskbar behaviors, system tray" icon="📐" />
              <SettingsCard title="Start" description="Start menu layout and apps" icon="🪟" />
            </div>
          </div>
        )}

        {activeCategory === 'network' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Network & internet</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📶</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">Connected</p>
                  <p className="text-xs text-gray-500">SwitchOS-Network</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <SettingsCard title="Wi-Fi" description="Manage known networks" icon="📶" />
              <SettingsCard title="Ethernet" description="IP settings, DNS, metered network" icon="🔌" />
              <SettingsCard title="VPN" description="Add VPN connections" icon="🛡️" />
            </div>
          </div>
        )}

        {!['system', 'personalization', 'network'].includes(activeCategory) && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className="text-sm text-gray-500">This settings page is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-default transition-colors">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <span className="ml-auto text-gray-400 text-sm">›</span>
    </div>
  );
}
