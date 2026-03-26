'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationStore, ContextMenuItem } from '@/store/useSimulationStore';
import type { FileSystemNode } from '@/simulation/fileSystem';
import { OS_CONFIGS } from '@/simulation/osConfig';

const ICON_MAP: Record<string, string> = {
  folder: '📁', file: '📄', text: '📄', image: '🖼️', document: '📋',
  executable: '⚡', app: '📦', fileexplorer: '📁', notepad: '📝',
  powershell: '💠', cmd: '⬛', winsettings: '⚙️', edge: '🌐', calculator: '🔢',
};

const NAV_ITEMS = [
  { label: 'Desktop', path: '/Users/you/Desktop', icon: '🖥️' },
  { label: 'Documents', path: '/Users/you/Documents', icon: '📄' },
  { label: 'Downloads', path: '/Users/you/Downloads', icon: '⬇️' },
  { label: 'Pictures', path: '/Users/you/Pictures', icon: '🖼️' },
  { label: 'Music', path: '/Users/you/Music', icon: '🎵' },
  { label: 'Videos', path: '/Users/you/Videos', icon: '🎬' },
];

type ViewMode = 'icons' | 'list' | 'details';

export default function FileExplorer({ windowId }: { windowId: string }) {
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
  const setClipboard = useSimulationStore((s) => s.setClipboard);
  const pasteClipboard = useSimulationStore((s) => s.pasteClipboard);

  const formatPath = OS_CONFIGS.windows.formatDisplayPath;
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
    const name = currentPath.split('/').pop() || 'File Explorer';
    updateWindowTitle(windowId, name);
  }, [currentPath, windowId, updateWindowTitle]);

  const navigate = (path: string) => {
    setCurrentPath(path);
    setSelectedId(null);
    const newHistory = [...history.slice(0, historyIndex + 1), path];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    recordAction({ type: 'click', target: { elementType: 'fileexplorer-navigate' }, data: { text: path } });
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

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      navigate('/' + parts.join('/') || '/');
    }
  };

  const handleItemDoubleClick = (node: FileSystemNode) => {
    recordAction({
      type: 'double-click',
      target: { elementId: node.id, elementType: 'fileexplorer-item' },
    });
    if (node.type === 'folder') {
      navigate(getNodePath(node.id));
    } else if (node.type === 'app') {
      const appId = node.icon || node.name.toLowerCase().replace(/\s+/g, '');
      launchApp(appId);
    } else if (node.type === 'file') {
      const ext = node.metadata?.fileExtension;
      if (ext === 'txt' || ext === 'md') {
        openWindow('notepad', { title: `${node.name} - Notepad`, meta: { fileId: node.id } });
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node?: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();

    const items: ContextMenuItem[] = node
      ? [
          { label: 'Open', action: `open:${node.id}` },
          { label: 'Rename', action: `rename:${node.id}`, shortcut: 'F2' },
          { label: '', action: '', separator: true },
          { label: 'Cut', action: `cut:${node.id}`, shortcut: 'Ctrl+X' },
          { label: 'Copy', action: `copy:${node.id}`, shortcut: 'Ctrl+C' },
          { label: '', action: '', separator: true },
          { label: 'Delete', action: `trash:${node.id}`, shortcut: 'Del' },
        ]
      : [
          { label: 'New Folder', action: 'newFolder', shortcut: 'Ctrl+Shift+N' },
          { label: '', action: '', separator: true },
          { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' },
          { label: '', action: '', separator: true },
          { label: 'View', action: 'view', disabled: true },
        ];

    showContextMenu(e.clientX, e.clientY, items);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail as string;
      if (action === 'newFolder' && currentNode) {
        const node = createFolderFn(currentNode.id, 'New folder');
        setEditingId(node.id);
        setEditValue(node.name);
      } else if (action === 'paste' && currentNode) {
        pasteClipboard(currentNode.id);
      } else if (action.startsWith('rename:')) {
        const nodeId = action.split(':')[1];
        const node = fileSystem.nodes[nodeId];
        if (node) { setEditingId(nodeId); setEditValue(node.name); }
      } else if (action.startsWith('trash:')) {
        deleteNode(action.split(':')[1]);
      } else if (action.startsWith('open:')) {
        const node = fileSystem.nodes[action.split(':')[1]];
        if (node) handleItemDoubleClick(node);
      } else if (action.startsWith('cut:')) {
        setClipboard('cut', [action.split(':')[1]]);
      } else if (action.startsWith('copy:')) {
        setClipboard('copy', [action.split(':')[1]]);
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

  return (
    <div className="flex h-full text-sm" style={{ fontFamily: '"Segoe UI", sans-serif' }} role="application" aria-label="File Explorer">
      {/* Navigation pane */}
      <div className="w-48 shrink-0 bg-gray-50 border-r border-gray-200 py-2 overflow-y-auto" role="navigation" aria-label="Navigation pane">
        <div className="px-3 py-1 text-[11px] font-semibold text-gray-500">Quick access</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`w-full text-left px-3 py-1 flex items-center gap-2 text-xs hover:bg-blue-50 ${
              currentPath === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <div className="h-px bg-gray-200 mx-3 my-2" />
        <div className="px-3 py-1 text-[11px] font-semibold text-gray-500">This PC</div>
        <button
          className="w-full text-left px-3 py-1 flex items-center gap-2 text-xs hover:bg-blue-50 text-gray-700"
          onClick={() => navigate('/')}
        >
          <span>💻</span>
          <span>Local Disk (C:)</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 bg-gray-50/80">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-1 text-gray-500 disabled:opacity-30 hover:bg-gray-200 rounded text-xs"
            aria-label="Back"
          >
            ←
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-1 text-gray-500 disabled:opacity-30 hover:bg-gray-200 rounded text-xs"
            aria-label="Forward"
          >
            →
          </button>
          <button
            onClick={goUp}
            className="p-1 text-gray-500 hover:bg-gray-200 rounded text-xs"
            aria-label="Up"
          >
            ↑
          </button>

          {/* Address bar */}
          <div className="flex-1 mx-2 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs text-gray-600 truncate">
            {formatPath(currentPath)}
          </div>
        </div>

        {/* Ribbon toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 bg-white">
          <button
            onClick={() => {
              if (currentNode) {
                const node = createFolderFn(currentNode.id, 'New folder');
                setEditingId(node.id);
                setEditValue(node.name);
                recordAction({ type: 'click', target: { elementType: 'fileexplorer-toolbar' }, data: { text: 'New Folder' } });
              }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded"
          >
            📁 New folder
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => {
              if (selectedId) { setClipboard('cut', [selectedId]); }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded"
          >
            ✂️ Cut
          </button>
          <button
            onClick={() => {
              if (selectedId) { setClipboard('copy', [selectedId]); }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded"
          >
            📋 Copy
          </button>
          <button
            onClick={() => {
              if (currentNode) { pasteClipboard(currentNode.id); }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded"
          >
            📌 Paste
          </button>
          <button
            onClick={() => {
              if (selectedId) {
                const node = fileSystem.nodes[selectedId];
                if (node) { setEditingId(selectedId); setEditValue(node.name); }
              }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded"
          >
            ✏️ Rename
          </button>
          <button
            onClick={() => {
              if (selectedId) { deleteNode(selectedId); setSelectedId(null); }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded"
          >
            🗑️ Delete
          </button>

          <div className="flex-1" />

          {/* View toggles */}
          <div className="flex gap-0.5 border border-gray-200 rounded">
            {(['icons', 'list', 'details'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                className={`px-2 py-0.5 text-[10px] ${viewMode === mode ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                onClick={() => setViewMode(mode)}
                aria-label={`${mode} view`}
              >
                {mode === 'icons' ? '⊞' : mode === 'list' ? '≡' : '☰'}
              </button>
            ))}
          </div>
        </div>

        {/* File listing */}
        <div
          className="flex-1 p-2 overflow-auto bg-white"
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
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, 80px)' }}>
              {children.map((node) => (
                <div
                  key={node.id}
                  className={`flex flex-col items-center p-2 rounded cursor-default ${
                    selectedId === node.id ? 'bg-blue-100 outline outline-1 outline-blue-300' : 'hover:bg-gray-50'
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
                      className="text-[10px] text-center w-full border border-blue-400 rounded px-0.5 mt-1"
                    />
                  ) : (
                    <span className="text-[10px] text-center mt-1 truncate max-w-full">{node.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="py-1 font-medium pl-2">Name</th>
                  <th className="py-1 font-medium w-28">Type</th>
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
                    <td className="py-0.5 pl-2 flex items-center gap-1.5">
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
                    <td className="py-0.5 text-gray-500">{node.type === 'folder' ? 'File folder' : (node.metadata?.fileExtension?.toUpperCase() || 'File') + ' File'}</td>
                    <td className="py-0.5 text-gray-500">{node.type === 'folder' ? '' : formatSize(node.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center px-3 py-1 border-t border-gray-200 text-[10px] text-gray-500 bg-gray-50">
          {children.length} item{children.length !== 1 ? 's' : ''}
          {selectedId && ' | 1 item selected'}
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
