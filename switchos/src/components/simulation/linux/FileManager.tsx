'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore, ContextMenuItem } from '@/store/useSimulationStore';
import type { FileSystemNode } from '@/simulation/fileSystem';

const ICON_MAP: Record<string, string> = {
  folder: '📁', file: '📄', text: '📄', image: '🖼️', document: '📋',
  app: '📦', filemanager: '📁', texteditor: '📝',
  linuxterminal: '⬛', linuxsettings: '⚙️',
};

const SIDEBAR_ITEMS = [
  { label: 'Home', path: '/home/you', icon: '🏠' },
  { label: 'Desktop', path: '/home/you/Desktop', icon: '🖥️' },
  { label: 'Documents', path: '/home/you/Documents', icon: '📄' },
  { label: 'Downloads', path: '/home/you/Downloads', icon: '⬇️' },
  { label: 'Pictures', path: '/home/you/Pictures', icon: '🖼️' },
  { label: 'Music', path: '/home/you/Music', icon: '🎵' },
  { label: 'Videos', path: '/home/you/Videos', icon: '🎬' },
  { label: 'Trash', path: '/Trash', icon: '🗑️' },
];

type ViewMode = 'icons' | 'list';

export default function FileManager({ windowId }: { windowId: string }) {
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

  const initialPath = (windowState?.meta?.path as string) || '/home/you';
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
    const name = currentPath === '/home/you' ? 'Home' : currentPath.split('/').pop() || 'Files';
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
        openWindow('texteditor', { title: node.name, meta: { fileId: node.id } });
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
          { label: 'Move to Trash', action: `trash:${node.id}`, shortcut: 'Del' },
        ]
      : [
          { label: 'New Folder', action: 'newFolder', shortcut: 'Ctrl+Shift+N' },
          { label: '', action: '', separator: true },
          { label: 'Properties', action: 'properties', disabled: true },
        ];

    showContextMenu(e.clientX, e.clientY, items);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail as string;
      if (action === 'newFolder' && currentNode) {
        const node = createFolderFn(currentNode.id, 'New Folder');
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
    <div className="flex h-full text-sm" style={{ fontFamily: '"Ubuntu", "Cantarell", sans-serif' }} role="application" aria-label="Files">
      {/* Sidebar */}
      <div className="w-44 shrink-0 bg-[#2d2d2d] border-r border-[#1a1a1a] py-2 overflow-y-auto" role="navigation" aria-label="Files sidebar">
        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Places</div>
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs ${
              currentPath === item.path ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
            }`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-[#383838]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2d2d2d] bg-[#353535]">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="px-2 py-0.5 text-gray-300 disabled:opacity-30 hover:bg-white/10 rounded text-sm"
            aria-label="Go back"
          >
            ◀
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="px-2 py-0.5 text-gray-300 disabled:opacity-30 hover:bg-white/10 rounded text-sm"
            aria-label="Go forward"
          >
            ▶
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-1 min-w-0">
            {breadcrumbs.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gray-500">/</span>}
                <button
                  className="hover:text-white truncate"
                  onClick={() => navigate('/' + breadcrumbs.slice(0, i + 1).join('/'))}
                >
                  {part}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* View toggles */}
          <div className="flex gap-0.5 border border-[#555] rounded">
            {(['icons', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`px-2 py-0.5 text-[10px] text-gray-300 ${viewMode === mode ? 'bg-white/15' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode(mode)}
                aria-label={`${mode} view`}
                aria-pressed={viewMode === mode}
              >
                {mode === 'icons' ? '⊞' : '≡'}
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
            <div className="flex items-center justify-center h-full text-gray-500 text-xs">
              This folder is empty
            </div>
          ) : viewMode === 'icons' ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, 80px)' }}>
              {children.map((node) => (
                <div
                  key={node.id}
                  className={`flex flex-col items-center p-2 rounded-lg cursor-default ${
                    selectedId === node.id ? 'bg-[#e95420]/30' : 'hover:bg-white/10'
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
                      className="text-[10px] text-center w-full border border-[#e95420] rounded px-0.5 bg-[#2d2d2d] text-white"
                    />
                  ) : (
                    <span className="text-[10px] text-center mt-1 truncate max-w-full text-gray-200">{node.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-xs text-gray-300">
              <thead>
                <tr className="border-b border-[#555] text-gray-400 text-left">
                  <th className="py-1 font-medium">Name</th>
                  <th className="py-1 font-medium w-24">Type</th>
                  <th className="py-1 font-medium w-20">Size</th>
                </tr>
              </thead>
              <tbody>
                {children.map((node) => (
                  <tr
                    key={node.id}
                    className={`cursor-default ${selectedId === node.id ? 'bg-[#e95420]/30' : 'hover:bg-white/5'}`}
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
                          className="border border-[#e95420] rounded px-0.5 text-xs bg-[#2d2d2d] text-white"
                        />
                      ) : (
                        <span>{node.name}</span>
                      )}
                    </td>
                    <td className="py-0.5 text-gray-400">{node.type === 'folder' ? 'Folder' : node.metadata?.fileExtension?.toUpperCase() || 'File'}</td>
                    <td className="py-0.5 text-gray-400">{node.type === 'folder' ? '--' : formatSize(node.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center px-3 py-1 border-t border-[#2d2d2d] text-[10px] text-gray-500">
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
