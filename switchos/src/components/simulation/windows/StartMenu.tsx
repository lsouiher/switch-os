'use client';

import React from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

interface StartMenuApp {
  appId: string;
  label: string;
  icon: string;
}

const PINNED_APPS: StartMenuApp[] = [
  { appId: 'fileexplorer', label: 'File Explorer', icon: '📁' },
  { appId: 'notepad', label: 'Notepad', icon: '📝' },
  { appId: 'powershell', label: 'PowerShell', icon: '💠' },
  { appId: 'cmd', label: 'Command Prompt', icon: '⬛' },
  { appId: 'winsettings', label: 'Settings', icon: '⚙️' },
  { appId: 'edge', label: 'Edge', icon: '🌐' },
  { appId: 'calculator', label: 'Calculator', icon: '🔢' },
  { appId: 'taskmanager', label: 'Task Manager', icon: '📊' },
];

export default function StartMenu({ onClose }: { onClose: () => void }) {
  const launchApp = useSimulationStore((s) => s.launchApp);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const getChildren = useSimulationStore((s) => s.getChildren);
  const getNodeByPath = useSimulationStore((s) => s.getNodeByPath);

  const handleAppClick = (app: StartMenuApp) => {
    recordAction({ type: 'click', target: { elementType: 'start-menu-app', elementId: app.appId }, data: { text: app.label } });
    launchApp(app.appId);
    onClose();
  };

  // Get recent files for "Recommended" section
  const desktopNode = getNodeByPath('/Users/you/Desktop');
  const documentsNode = getNodeByPath('/Users/you/Documents');
  const recentFiles = [
    ...(desktopNode ? getChildren(desktopNode.id).filter((n) => n.type === 'file') : []),
    ...(documentsNode ? getChildren(documentsNode.id).filter((n) => n.type === 'file') : []),
  ].slice(0, 4);

  return (
    <div
      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[540px] z-[9999] animate-slideUp"
      style={{
        background: 'rgba(44, 44, 44, 0.95)',
        backdropFilter: 'blur(40px)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search bar */}
      <div className="px-6 pt-5 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span className="text-white/50 text-xs">🔍</span>
          <span className="text-white/40 text-xs">Type to search</span>
        </div>
      </div>

      {/* Pinned section */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">Pinned</span>
          <button className="text-[11px] text-white/60 hover:text-white/80 px-2 py-0.5 rounded hover:bg-white/5">
            All apps &gt;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {PINNED_APPS.map((app) => (
            <button
              key={app.appId}
              onClick={() => handleAppClick(app)}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">{app.icon}</span>
              <span className="text-[11px] text-white/80 truncate w-full text-center">{app.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-white/10 mx-6" />

      {/* Recommended section */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">Recommended</span>
        </div>
        {recentFiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-1">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-default"
              >
                <span className="text-sm">
                  {file.icon === 'text' ? '📄' : file.icon === 'image' ? '🖼️' : file.icon === 'document' ? '📋' : '📄'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-white/80 truncate">{file.name}</p>
                  <p className="text-[10px] text-white/40">Recently added</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/40">No recent items</p>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '0 0 12px 12px',
          background: 'rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10 cursor-default transition-colors">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <span className="text-xs text-white/80">User</span>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white/80">
          <span className="text-sm">⏻</span>
        </button>
      </div>
    </div>
  );
}
