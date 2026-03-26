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
  { id: 'dock-finder', appId: 'finder', label: 'Finder', icon: '📁' },
  { id: 'dock-textedit', appId: 'textedit', label: 'TextEdit', icon: '📝' },
  { id: 'dock-terminal', appId: 'terminal', label: 'Terminal', icon: '⬛' },
  { id: 'dock-settings', appId: 'settings', label: 'System Settings', icon: '⚙️' },
];

const TRASH_ITEM: DockItem = { id: 'dock-trash', appId: 'trash', label: 'Trash', icon: '🗑️' };

export default function Dock() {
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
      launchApp('finder');
      return;
    }
    launchApp(item.appId);
  };

  const getScale = (itemId: string, index: number) => {
    if (!hoveredId) return 1;
    const hoveredIndex = [...DOCK_ITEMS, TRASH_ITEM].findIndex((i) => i.id === hoveredId);
    if (hoveredIndex === -1) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.05;
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

  const allItems = [...DOCK_ITEMS];

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[9998]">
      <div
        className="flex items-end gap-1 px-3 py-1.5 rounded-2xl"
        style={{
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {allItems.map((item, i) => (
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
        <div className="w-px h-10 bg-white/30 mx-1 self-center" />

        {/* Trash with drop zone */}
        <div
          onDragOver={handleTrashDragOver}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
        >
          <DockIcon
            item={{ ...TRASH_ITEM, icon: trashHasItems ? '🗑️' : '🗑️' }}
            scale={getScale(TRASH_ITEM.id, allItems.length)}
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
      className="relative flex flex-col items-center"
      onMouseEnter={() => { onHover(); setShowTooltip(true); }}
      onMouseLeave={() => { onLeave(); setShowTooltip(false); }}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute -top-8 whitespace-nowrap px-2 py-1 rounded text-xs text-white"
          style={{ background: 'rgba(0,0,0,0.75)', fontSize: '11px' }}
        >
          {item.label}
        </div>
      )}

      {/* Icon */}
      <button
        onClick={onClick}
        aria-label={item.label}
        className="w-12 h-12 flex items-center justify-center rounded-xl transition-transform duration-150 hover:brightness-110"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'bottom center',
          fontSize: '28px',
          background: highlight ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
          boxShadow: highlight ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none',
          borderRadius: '12px',
        }}
      >
        {item.icon}
      </button>

      {/* Running indicator */}
      {isRunning && (
        <div className="w-1 h-1 rounded-full bg-white/80 mt-0.5" aria-label={`${item.label} is running`} />
      )}
    </div>
  );
}
