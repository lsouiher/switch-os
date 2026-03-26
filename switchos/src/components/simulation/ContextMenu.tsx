'use client';

import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';

export default function ContextMenu() {
  const contextMenu = useSimulationStore((s) => s.contextMenu);
  const hideContextMenu = useSimulationStore((s) => s.hideContextMenu);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => hideContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [hideContextMenu]);

  if (!contextMenu) return null;

  return (
    <div
      ref={ref}
      className="fixed rounded-lg py-1 min-w-[200px] z-[10000]"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.85)',
        boxShadow: '0 6px 30px rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,0,0,0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '13px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px bg-gray-200 my-1 mx-2" />
        ) : (
          <button
            key={i}
            className="w-full text-left px-4 py-1 hover:bg-blue-500 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current flex justify-between items-center"
            disabled={item.disabled}
            onClick={() => {
              hideContextMenu();
              // Actions are dispatched from the parent component
              document.dispatchEvent(
                new CustomEvent('contextmenu-action', { detail: item.action })
              );
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
