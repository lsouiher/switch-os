'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

interface DockItem {
  id: string;
  appId: string;
  label: string;
  icon: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'dock-files', appId: 'filemanager', label: 'Files', icon: '📁' },
  { id: 'dock-editor', appId: 'texteditor', label: 'Text Editor', icon: '📝' },
  { id: 'dock-terminal', appId: 'linuxterminal', label: 'Terminal', icon: '⬛' },
  { id: 'dock-settings', appId: 'linuxsettings', label: 'Settings', icon: '⚙️' },
];

const TRASH_ITEM: DockItem = { id: 'dock-trash', appId: 'trash', label: 'Trash', icon: '🗑️' };

export default function GnomeDock() {
  const launchApp = useSimulationStore((s) => s.launchApp);
  const runningApps = useSimulationStore((s) => s.runningApps);
  const fileSystem = useSimulationStore((s) => s.fileSystem);
  const deleteNode = useSimulationStore((s) => s.deleteNode);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragOverTrash, setDragOverTrash] = useState(false);

  const trashNode = fileSystem.nodes[fileSystem.trashId];
  const trashHasItems = trashNode && trashNode.children.length > 0;

  const handleClick = (item: DockItem) => {
    if (item.appId === 'trash') {
      launchApp('filemanager');
      return;
    }
    launchApp(item.appId);
  };

  const getScale = (itemId: string, index: number) => {
    if (!hoveredId) return 1;
    const allItems = [...DOCK_ITEMS, TRASH_ITEM];
    const hoveredIndex = allItems.findIndex((i) => i.id === hoveredId);
    if (hoveredIndex === -1) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.3;
    if (distance === 1) return 1.15;
    return 1;
  };

  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTrash(true);
  };

  const handleTrashDragLeave = () => {
    setDragOverTrash(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTrash(false);
    const nodeId = e.dataTransfer.getData('text/plain');
    if (nodeId) {
      deleteNode(nodeId);
      recordAction({
        type: 'drag',
        target: { elementId: nodeId, elementType: 'dock-trash' },
        data: { dragEnd: { x: e.clientX, y: e.clientY } },
      });
    }
  };

  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-[9998]">
      <div
        className="flex flex-col items-center gap-1 px-1.5 py-3 rounded-2xl"
        style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(30,30,30,0.7)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {DOCK_ITEMS.map((item, i) => (
          <DockIcon
            key={item.id}
            item={item}
            scale={getScale(item.id, i)}
            isRunning={runningApps.has(item.appId)}
            onHover={() => setHoveredId(item.id)}
            onLeave={() => setHoveredId(null)}
            onClick={() => handleClick(item)}
          />
        ))}

        {/* Separator */}
        <div className="h-px w-8 bg-white/20 my-1" />

        {/* Trash with drop zone */}
        <div
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
        >
          <DockIcon
            item={{ ...TRASH_ITEM, icon: trashHasItems ? '🗑️' : '🗑️' }}
            scale={getScale(TRASH_ITEM.id, DOCK_ITEMS.length)}
            isRunning={false}
            onHover={() => setHoveredId(TRASH_ITEM.id)}
            onLeave={() => setHoveredId(null)}
            onClick={() => handleClick(TRASH_ITEM)}
            highlight={dragOverTrash}
          />
        </div>
      </div>
    </div>
  );
}

function DockIcon({
  item,
  scale,
  isRunning,
  onHover,
  onLeave,
  onClick,
  highlight,
}: {
  item: DockItem;
  scale: number;
  isRunning: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  highlight?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => { onHover(); setShowTooltip(true); }}
      onMouseLeave={() => { onLeave(); setShowTooltip(false); }}
    >
      {/* Running indicator */}
      {isRunning && (
        <div
          className="absolute -left-1.5 w-1 h-1 rounded-full"
          style={{ background: '#e95420' }}
          aria-label={`${item.label} is running`}
        />
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute left-14 whitespace-nowrap px-2 py-1 rounded text-xs text-white z-[10000]"
          style={{ background: 'rgba(0,0,0,0.8)', fontSize: '11px' }}
        >
          {item.label}
        </div>
      )}

      {/* Icon */}
      <button
        onClick={onClick}
        aria-label={item.label}
        className="w-11 h-11 flex items-center justify-center rounded-xl transition-transform duration-150"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center left',
          fontSize: '26px',
          background: highlight ? 'rgba(233, 84, 32, 0.3)' : 'transparent',
          boxShadow: highlight ? '0 0 12px rgba(233, 84, 32, 0.5)' : 'none',
        }}
      >
        {item.icon}
      </button>
    </div>
  );
}
