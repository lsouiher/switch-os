'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

const APP_MAP: Record<string, { label: string; icon: string; appId: string }> = {
  fileexplorer: { label: 'File Explorer', icon: '📁', appId: 'fileexplorer' },
  notepad: { label: 'Notepad', icon: '📝', appId: 'notepad' },
  powershell: { label: 'PowerShell', icon: '💠', appId: 'powershell' },
  cmd: { label: 'Command Prompt', icon: '⬛', appId: 'cmd' },
  winsettings: { label: 'Settings', icon: '⚙️', appId: 'winsettings' },
  edge: { label: 'Microsoft Edge', icon: '🌐', appId: 'edge' },
  calculator: { label: 'Calculator', icon: '🔢', appId: 'calculator' },
  taskmanager: { label: 'Task Manager', icon: '📊', appId: 'taskmanager' },
};

export default function SearchOverlay() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const findByName = useSimulationStore((s) => s.findByName);
  const launchApp = useSimulationStore((s) => s.launchApp);
  const closeSpotlight = useSimulationStore((s) => s.closeSpotlight);
  const recordAction = useSimulationStore((s) => s.recordAction);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fileResults = query.length > 0 ? findByName(query).slice(0, 5) : [];
  const appResults = query.length > 0
    ? Object.values(APP_MAP).filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleAppClick = (appId: string) => {
    recordAction({ type: 'click', target: { elementType: 'search-result', elementId: appId } });
    launchApp(appId);
    closeSpotlight();
  };

  return (
    <div
      className="absolute inset-0 z-[10000] flex items-start justify-center pt-[20%]"
      onClick={closeSpotlight}
    >
      <div
        className="w-[540px]"
        style={{
          background: 'rgba(44, 44, 44, 0.95)',
          backdropFilter: 'blur(40px)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-white/50">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type here to search"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/40"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeSpotlight();
            }}
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-auto py-2">
          {query.length === 0 ? (
            <div className="px-4 py-3 text-xs text-white/40">
              Start typing to search apps, files, and settings
            </div>
          ) : (
            <>
              {appResults.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-[10px] text-white/40 uppercase font-medium">Apps</div>
                  {appResults.map((app) => (
                    <button
                      key={app.appId}
                      onClick={() => handleAppClick(app.appId)}
                      className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-lg">{app.icon}</span>
                      <span className="text-sm text-white/90">{app.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {fileResults.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-[10px] text-white/40 uppercase font-medium mt-1">Files</div>
                  {fileResults.map((node) => (
                    <div
                      key={node.id}
                      className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default"
                    >
                      <span className="text-lg">{node.type === 'folder' ? '📁' : '📄'}</span>
                      <span className="text-sm text-white/90">{node.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {appResults.length === 0 && fileResults.length === 0 && (
                <div className="px-4 py-3 text-xs text-white/40">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
