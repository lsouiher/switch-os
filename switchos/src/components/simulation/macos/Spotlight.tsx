'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { FileSystemNode } from '@/simulation/fileSystem';

const ICON_MAP: Record<string, string> = {
  folder: '📁', file: '📄', text: '📄', image: '🖼️', app: '📦',
  finder: '📁', textedit: '📝', terminal: '⬛', settings: '⚙️',
};

export default function Spotlight() {
  const closeSpotlight = useSimulationStore((s) => s.closeSpotlight);
  const findByName = useSimulationStore((s) => s.findByName);
  const openWindow = useSimulationStore((s) => s.openWindow);
  const launchApp = useSimulationStore((s) => s.launchApp);
  const getNodePath = useSimulationStore((s) => s.getNodePath);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileSystemNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const found = findByName(query).filter(
        (n) => !n.metadata?.isSystem && n.name !== '/' && n.name !== 'you' && n.name !== 'Users'
      ).slice(0, 12);
      setResults(found);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, findByName]);

  // Group results by type
  const grouped = results.reduce<{ apps: FileSystemNode[]; folders: FileSystemNode[]; files: FileSystemNode[] }>(
    (acc, node) => {
      if (node.type === 'app') acc.apps.push(node);
      else if (node.type === 'folder') acc.folders.push(node);
      else acc.files.push(node);
      return acc;
    },
    { apps: [], folders: [], files: [] }
  );

  // Flat list for keyboard navigation
  const flatResults = [...grouped.apps, ...grouped.folders, ...grouped.files];

  const handleSelect = (node: FileSystemNode) => {
    recordAction({
      type: 'click',
      target: { elementId: node.id, elementType: 'spotlight-result' },
      data: { text: node.name },
    });

    if (node.type === 'app') {
      const appId = node.name.replace('.app', '').toLowerCase().replace(/\s+/g, '');
      launchApp(appId);
    } else if (node.type === 'folder') {
      openWindow('finder', { meta: { path: getNodePath(node.id) } });
    } else {
      const ext = node.metadata?.fileExtension;
      if (ext === 'txt' || ext === 'md') {
        openWindow('textedit', { title: node.name, meta: { fileId: node.id } });
      }
    }
    closeSpotlight();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSpotlight();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      handleSelect(flatResults[selectedIndex]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-start justify-center pt-[20vh]"
      onClick={closeSpotlight}
    >
      <div
        className="w-[600px] rounded-xl overflow-hidden"
        style={{
          backdropFilter: 'blur(40px)',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-xl text-gray-400">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-lg"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            role="combobox"
            aria-label="Spotlight Search"
            aria-expanded={flatResults.length > 0}
            aria-autocomplete="list"
          />
        </div>

        {/* Results */}
        {flatResults.length > 0 && (
          <div className="border-t border-gray-200 max-h-[400px] overflow-y-auto">
            {/* Top Hit */}
            {flatResults.length > 0 && (() => {
              const topHit = flatResults[0];
              const isSelected = selectedIndex === 0;
              return (
                <div>
                  <div className="px-4 pt-2 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Top Hit
                  </div>
                  <button
                    key={topHit.id}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 ${
                      isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelect(topHit)}
                    onMouseEnter={() => setSelectedIndex(0)}
                  >
                    <span className="text-3xl">
                      {ICON_MAP[topHit.icon] || ICON_MAP[topHit.type] || '📄'}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{topHit.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                        {topHit.type === 'app' ? 'Application' : getNodePath(topHit.id)}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })()}

            {/* Grouped sections (skip first item — already shown as Top Hit) */}
            {([
              { label: 'Applications', items: grouped.apps },
              { label: 'Folders', items: grouped.folders },
              { label: 'Documents', items: grouped.files },
            ] as const).map(({ label, items }) => {
              // Filter out the top hit from its group
              const filtered = items.filter((n) => n.id !== flatResults[0]?.id);
              if (filtered.length === 0) return null;
              return (
                <div key={label}>
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-200">
                    {label}
                  </div>
                  {filtered.map((node) => {
                    const flatIndex = flatResults.indexOf(node);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={node.id}
                        className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                          isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleSelect(node)}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <span className="text-2xl">
                          {ICON_MAP[node.icon] || ICON_MAP[node.type] || '📄'}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{node.name}</div>
                          <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                            {node.type === 'app' ? 'Application' : getNodePath(node.id)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
