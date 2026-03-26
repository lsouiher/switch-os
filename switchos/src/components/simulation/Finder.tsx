'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore, ContextMenuItem } from '@/store/useSimulationStore';
import type { FileSystemNode } from '@/simulation/fileSystem';

const ICON_MAP: Record<string, string> = {
  folder: '📁', file: '📄', text: '📄', image: '🖼️', document: '📋',
  'disk-image': '💿', app: '📦', finder: '📁', textedit: '📝',
  terminal: '⬛', settings: '⚙️', safari: '🧭', calculator: '🔢',
};

const SIDEBAR_ITEMS = [
  { label: 'Desktop', path: '/Users/you/Desktop', icon: '🖥️' },
  { label: 'Documents', path: '/Users/you/Documents', icon: '📄' },
  { label: 'Downloads', path: '/Users/you/Downloads', icon: '⬇️' },
  { label: 'Pictures', path: '/Users/you/Pictures', icon: '🖼️' },
  { label: 'Music', path: '/Users/you/Music', icon: '🎵' },
  { label: 'Movies', path: '/Users/you/Movies', icon: '🎬' },
  { label: 'Applications', path: '/Applications', icon: '📦' },
];

type ViewMode = 'icons' | 'list' | 'columns';

export default function Finder({ windowId }: { windowId: string }) {
  const windowState = useSimulationStore((s) => s.windowManager.windows[windowId]);
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const getNodeByPath = useSimulationStore((s) => s.getNodeByPath);
  const getChildren = useSimulationStore((s) => s.getChildren);
  const getNodePath = useSimulationStore((s) => s.getNodePath);
  const openWindow = useSimulationStore((s) => s.openWindow);
  const launchApp = useSimulationStore((s) => s.launchApp);
  const updateWindowTitle = useSimulationStore((s) => s.updateWindowTitle);
  const createFolderFn = useSimulationStore((s) => s.createFolder);
  const renameNode = useSimulationStore((s) => s.renameNode);
  const deleteNode = useSimulationStore((s) => s.deleteNode);
  const showContextMenu = useSimulationStore((s) => s.showContextMenu);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const moveNode = useSimulationStore((s) => s.moveNode);

  const initialPath = (windowState?.meta?.path as string) || '/Users/you/Desktop';
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const currentNode = getNodeByPath(currentPath);
  const children = currentNode ? getChildren(currentNode.id) : [];

  useEffect(() => {
    const name = currentPath.split('/').pop() || 'Finder';
    updateWindowTitle(windowId, name);
  }, [currentPath, windowId, updateWindowTitle]);

  const navigate = (path: string) => {
    setCurrentPath(path);
    setSelectedId(null);
    const newHistory = [...history.slice(0, historyIndex + 1), path];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    recordAction({ type: 'click', target: { elementType: 'finder-navigate' }, data: { text: path } });
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  };

  const handleItemDoubleClick = (node: FileSystemNode) => {
    recordAction({
      type: 'double-click',
      target: { elementId: node.id, elementType: 'finder-item' },
    });
    if (node.type === 'folder') {
      navigate(getNodePath(node.id));
    } else if (node.type === 'app') {
      const appId = node.name.replace('.app', '').toLowerCase().replace(/\s+/g, '');
      launchApp(appId);
    } else if (node.type === 'file') {
      const ext = node.metadata?.fileExtension;
      if (ext === 'txt' || ext === 'md') {
        openWindow('textedit', { title: node.name, meta: { fileId: node.id } });
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node?: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();

    const items: ContextMenuItem[] = node
      ? [
          { label: 'Open', action: `open:${node.id}` },
          { label: 'Rename', action: `rename:${node.id}` },
          { label: '', action: '', separator: true },
          { label: 'Move to Trash', action: `trash:${node.id}`, shortcut: '⌘⌫' },
        ]
      : [
          { label: 'New Folder', action: 'newFolder', shortcut: '⇧⌘N' },
          { label: '', action: '', separator: true },
          { label: 'Get Info', action: 'getInfo', disabled: true },
        ];

    showContextMenu(e.clientX, e.clientY, items);
  };

  // Listen for context menu actions
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail as string;
      if (action === 'newFolder' && currentNode) {
        const node = createFolderFn(currentNode.id, 'untitled folder');
        setEditingId(node.id);
        setEditValue(node.name);
      } else if (action.startsWith('rename:')) {
        const nodeId = action.split(':')[1];
        const node = fileSystem.nodes[nodeId];
        if (node) { setEditingId(nodeId); setEditValue(node.name); }
      } else if (action.startsWith('trash:')) {
        deleteNode(action.split(':')[1]);
      } else if (action.startsWith('open:')) {
        const node = fileSystem.nodes[action.split(':')[1]];
        if (node) handleItemDoubleClick(node);
      }
    };
    document.addEventListener('contextmenu-action', handler);
    return () => document.removeEventListener('contextmenu-action', handler);
  });

  const handleRenameConfirm = (nodeId: string) => {
    if (editValue.trim()) {
      renameNode(nodeId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: FileSystemNode) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && targetNode.type === 'folder') {
      moveNode(draggedId, targetNode.id);
    }
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="flex h-full text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }} role="application" aria-label="Finder">
      {/* Sidebar */}
      <div className="w-48 shrink-0 bg-gray-50/80 border-r border-gray-200 py-2 overflow-y-auto" role="navigation" aria-label="Finder sidebar">
        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Favorites</div>
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`w-full text-left px-3 py-1 flex items-center gap-2 text-xs hover:bg-gray-200/50 ${
              currentPath === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="px-2 py-0.5 text-gray-500 disabled:opacity-30 hover:bg-gray-200 rounded text-sm focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Go back"
          >
            ◀
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="px-2 py-0.5 text-gray-500 disabled:opacity-30 hover:bg-gray-200 rounded text-sm focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Go forward"
          >
            ▶
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-1 min-w-0">
            {breadcrumbs.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-300">/</span>}
                <button
                  className="hover:text-blue-500 truncate"
                  onClick={() => navigate('/' + breadcrumbs.slice(0, i + 1).join('/'))}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* View toggles */}
          <div className="flex gap-0.5 border border-gray-200 rounded">
            {(['icons', 'list', 'columns'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`px-2 py-0.5 text-[10px] focus-visible:ring-2 focus-visible:ring-blue-400 ${viewMode === mode ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => setViewMode(mode)}
                aria-label={`${mode} view`}
                aria-pressed={viewMode === mode}
              >
                {mode === 'icons' ? '⊞' : mode === 'list' ? '≡' : '❘❘❘'}
              </button>
            ))}
          </div>
        </div>

        {/* File listing */}
        <div
          className="flex-1 p-3 overflow-auto"
          onContextMenu={(e) => handleContextMenu(e)}
          onClick={() => setSelectedId(null)}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={(e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId && currentNode) {
              moveNode(draggedId, currentNode.id);
            }
          }}
        >
          {children.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
              This folder is empty
            </div>
          ) : viewMode === 'icons' ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, 80px)' }}>
              {children.map((node) => (
                <div
                  key={node.id}
                  className={`flex flex-col items-center p-2 rounded-lg cursor-default ${
                    selectedId === node.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }}
                  onDoubleClick={() => handleItemDoubleClick(node)}
                  onContextMenu={(e) => handleContextMenu(e, node)}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', node.id)}
                  onDragOver={(e) => { if (node.type === 'folder') e.preventDefault(); }}
                  onDrop={(e) => handleDrop(e, node)}
                >
                  <span className="text-3xl">{ICON_MAP[node.icon] || ICON_MAP[node.type] || '📄'}</span>
                  {editingId === node.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleRenameConfirm(node.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(node.id); }}
                      className="text-[10px] text-center w-full border border-blue-400 rounded px-0.5"
                    />
                  ) : (
                    <span className="text-[10px] text-center mt-1 truncate max-w-full">{node.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="py-1 font-medium">Name</th>
                  <th className="py-1 font-medium w-24">Kind</th>
                  <th className="py-1 font-medium w-20">Size</th>
                </tr>
              </thead>
              <tbody>
                {children.map((node) => (
                  <tr
                    key={node.id}
                    className={`cursor-default ${selectedId === node.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }}
                    onDoubleClick={() => handleItemDoubleClick(node)}
                    onContextMenu={(e) => handleContextMenu(e, node)}
                  >
                    <td className="py-0.5 flex items-center gap-1.5">
                      <span className="text-sm">{ICON_MAP[node.icon] || '📄'}</span>
                      {editingId === node.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleRenameConfirm(node.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(node.id); }}
                          className="border border-blue-400 rounded px-0.5 text-xs"
                        />
                      ) : (
                        <span>{node.name}</span>
                      )}
                    </td>
                    <td className="py-0.5 text-gray-500">{node.type === 'folder' ? 'Folder' : node.metadata?.fileExtension?.toUpperCase() || 'File'}</td>
                    <td className="py-0.5 text-gray-500">{node.type === 'folder' ? '--' : formatSize(node.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-400 text-xs">Column view coming soon</div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center px-3 py-1 border-t border-gray-200 text-[10px] text-gray-400">
          {children.length} items
        </div>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
