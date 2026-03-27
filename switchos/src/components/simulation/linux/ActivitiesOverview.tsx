'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { FileSystemNode } from '@/simulation/fileSystem';

const ICON_MAP: Record<string, string> = {
  folder: '📁', file: '📄', text: '📄', image: '🖼️', app: '📦',
  filemanager: '📁', texteditor: '📝', linuxterminal: '⬛', linuxsettings: '⚙️',
};

export default function ActivitiesOverview() {
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
        (n) => !n.metadata?.isSystem && n.name !== '/' && n.name !== 'you' && n.name !== 'home'
      ).slice(0, 12);
      setResults(found);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, findByName]);

  const grouped = results.reduce<{ apps: FileSystemNode[]; folders: FileSystemNode[]; files: FileSystemNode[] }>(
    (acc, node) => {
      if (node.type === 'app') acc.apps.push(node);
      else if (node.type === 'folder') acc.folders.push(node);
      else acc.files.push(node);
      return acc;
    },
    { apps: [], folders: [], files: [] }
  );

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
      openWindow('filemanager', { meta: { path: getNodePath(node.id) } });
    } else {
      const ext = node.metadata?.fileExtension;
      if (ext === 'txt' || ext === 'md') {
        openWindow('texteditor', { title: node.name, meta: { fileId: node.id } });
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
      className="fixed inset-0 z-[10001] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={closeSpotlight}
    >
      <div
        className="w-[600px] rounded-xl overflow-hidden"
        style={{
          background: '#3d3d3d',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
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
            placeholder="Type to search..."
            className="flex-1 bg-transparent outline-none text-lg text-white"
            style={{ fontFamily: '"Ubuntu", "Cantarell", sans-serif' }}
            role="combobox"
            aria-label="Activities Search"
            aria-expanded={flatResults.length > 0}
            aria-autocomplete="list"
          />
        </div>

        {/* Results */}
        {flatResults.length > 0 && (
          <div className="border-t border-[#555] max-h-[400px] overflow-y-auto">
            {([
              { label: 'Applications', items: grouped.apps },
              { label: 'Folders', items: grouped.folders },
              { label: 'Files', items: grouped.files },
            ] as const).map(({ label, items }) => {
              if (items.length === 0) return null;
              return (
                <div key={label}>
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    {label}
                  </div>
                  {items.map((node) => {
                    const flatIndex = flatResults.indexOf(node);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={node.id}
                        className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                          isSelected ? 'bg-[#e95420] text-white' : 'text-gray-200 hover:bg-white/10'
                        }`}
                        onClick={() => handleSelect(node)}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <span className="text-2xl">
                          {ICON_MAP[node.icon] || ICON_MAP[node.type] || '📄'}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{node.name}</div>
                          <div className={`text-xs ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
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
