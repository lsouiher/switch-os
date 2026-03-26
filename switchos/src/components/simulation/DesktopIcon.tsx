'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

const ICON_MAP: Record<string, string> = {
  folder: '📁',
  file: '📄',
  text: '📄',
  image: '🖼️',
  document: '📋',
  'disk-image': '💿',
  app: '📦',
  finder: '📁',
  textedit: '📝',
  terminal: '⬛',
  settings: '⚙️',
};

interface DesktopIconProps {
  nodeId: string;
  x: number;
  y: number;
  selected: boolean;
  editing: boolean;
}

export default function DesktopIcon({ nodeId, x, y, selected, editing }: DesktopIconProps) {
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const selectDesktopIcon = useSimulationStore((s) => s.selectDesktopIcon);
  const startEditingIcon = useSimulationStore((s) => s.startEditingIcon);
  const stopEditingIcon = useSimulationStore((s) => s.stopEditingIcon);
  const renameNode = useSimulationStore((s) => s.renameNode);
  const launchApp = useSimulationStore((s) => s.launchApp);
  const openWindow = useSimulationStore((s) => s.openWindow);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const moveDesktopIcon = useSimulationStore((s) => s.moveDesktopIcon);

  const node = fileSystem.nodes[nodeId];
  const [editValue, setEditValue] = useState(node?.name || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, iconX: x, iconY: y });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!node) return null;

  const icon = ICON_MAP[node.icon] || ICON_MAP[node.type] || '📄';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectDesktopIcon(nodeId);
    recordAction({
      type: 'click',
      target: { elementId: nodeId, elementType: 'desktop-icon', coordinates: { x: e.clientX, y: e.clientY } },
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordAction({
      type: 'double-click',
      target: { elementId: nodeId, elementType: 'desktop-icon' },
    });

    if (node.type === 'folder') {
      openWindow('finder', { meta: { path: `/Users/you/Desktop/${node.name}` } });
    } else if (node.type === 'file') {
      const ext = node.metadata?.fileExtension;
      if (ext === 'txt' || ext === 'md') {
        openWindow('textedit', { title: node.name, meta: { fileId: nodeId } });
      }
    } else if (node.type === 'app') {
      const appId = node.name.replace('.app', '').toLowerCase().replace(/\s+/g, '');
      launchApp(appId);
    }
  };

  const handleRenameConfirm = () => {
    if (editValue.trim() && editValue !== node.name) {
      renameNode(nodeId, editValue.trim());
    }
    stopEditingIcon();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editing) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, iconX: x, iconY: y };

    const handleMouseMove = (me: MouseEvent) => {
      setDragging(true);
      const dx = me.clientX - dragStartRef.current.x;
      const dy = me.clientY - dragStartRef.current.y;
      moveDesktopIcon(nodeId, dragStartRef.current.iconX + dx, dragStartRef.current.iconY + dy);
    };

    const handleMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="absolute flex flex-col items-center w-20 cursor-default select-none focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 rounded-lg"
      style={{
        left: x,
        top: y,
        zIndex: dragging ? 100 : 1,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      role="button"
      tabIndex={0}
      aria-label={`${node.name}, ${node.type}`}
      aria-selected={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleDoubleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      <div
        className="text-4xl p-1 rounded-lg"
        style={{
          background: selected ? 'rgba(59,130,246,0.3)' : 'transparent',
        }}
      >
        {icon}
      </div>
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameConfirm}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameConfirm();
            if (e.key === 'Escape') stopEditingIcon();
          }}
          className="text-xs text-center bg-white border border-blue-400 rounded px-1 w-full outline-none"
          style={{ fontSize: '11px' }}
        />
      ) : (
        <span
          className="text-xs text-center leading-tight px-1 rounded max-w-full truncate"
          style={{
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            background: selected ? 'rgba(59,130,246,0.6)' : 'transparent',
            fontSize: '11px',
          }}
        >
          {node.name}
        </span>
      )}
    </div>
  );
}
