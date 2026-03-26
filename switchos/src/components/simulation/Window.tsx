'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import type { WindowState } from '@/simulation/windowManager';

interface WindowProps {
  windowId: string;
  children: React.ReactNode;
}

export default function Window({ windowId, children }: WindowProps) {
  const windowState = useSimulationStore((s) => s.windowManager.windows[windowId]);
  const focusWindow = useSimulationStore((s) => s.focusWindow);
  const closeWindow = useSimulationStore((s) => s.closeWindow);
  const minimizeWindow = useSimulationStore((s) => s.minimizeWindow);
  const maximizeWindow = useSimulationStore((s) => s.maximizeWindow);
  const moveWindowTo = useSimulationStore((s) => s.moveWindowTo);
  const resizeWindowTo = useSimulationStore((s) => s.resizeWindowTo);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const [preMaximize, setPreMaximize] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const handleTitleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.traffic-light')) return;
      e.preventDefault();
      focusWindow(windowId);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWinX = windowState.x;
      const startWinY = windowState.y;

      const onMove = (me: MouseEvent) => {
        const dx = me.clientX - startX;
        const dy = me.clientY - startY;
        moveWindowTo(windowId, startWinX + dx, Math.max(28, startWinY + dy));
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [windowId, windowState?.x, windowState?.y, focusWindow, moveWindowTo]
  );

  const handleResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();
      focusWindow(windowId);

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = windowState.width;
      const startH = windowState.height;
      const startWinX = windowState.x;
      const startWinY = windowState.y;

      const onMove = (me: MouseEvent) => {
        const dx = me.clientX - startX;
        const dy = me.clientY - startY;

        let newW = startW;
        let newH = startH;
        let newX = startWinX;
        let newY = startWinY;

        if (direction.includes('e')) newW = startW + dx;
        if (direction.includes('w')) { newW = startW - dx; newX = startWinX + dx; }
        if (direction.includes('s')) newH = startH + dy;
        if (direction.includes('n')) { newH = startH - dy; newY = startWinY + dy; }

        newW = Math.max(newW, windowState.minWidth);
        newH = Math.max(newH, windowState.minHeight);

        resizeWindowTo(windowId, newW, newH);
        if (direction.includes('w') || direction.includes('n')) {
          moveWindowTo(windowId, newX, newY);
        }
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [windowId, windowState, focusWindow, resizeWindowTo, moveWindowTo]
  );

  if (!windowState || windowState.isMinimized) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordAction({ type: 'click', target: { elementId: windowId, elementType: 'window-close' } });
    closeWindow(windowId);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(windowId);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (windowState.isMaximized && preMaximize) {
      moveWindowTo(windowId, preMaximize.x, preMaximize.y);
      resizeWindowTo(windowId, preMaximize.w, preMaximize.h);
      setPreMaximize(null);
    } else {
      setPreMaximize({ x: windowState.x, y: windowState.y, w: windowState.width, h: windowState.height });
    }
    maximizeWindow(windowId);
  };

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col"
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: windowState.isFocused
          ? '0 22px 70px 4px rgba(0,0,0,0.56)'
          : '0 8px 30px rgba(0,0,0,0.2)',
        opacity: windowState.isFocused ? 1 : 0.95,
      }}
      onMouseDown={() => focusWindow(windowId)}
      role="dialog"
      aria-label={`${windowState.title} window`}
    >
      {/* Title bar */}
      <div
        className="flex items-center h-9 px-3 shrink-0 cursor-default select-none"
        style={{
          background: windowState.isFocused
            ? 'linear-gradient(180deg, #e8e8e8 0%, #d6d6d6 100%)'
            : '#f0f0f0',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
        onMouseDown={handleTitleBarMouseDown}
      >
        {/* Traffic lights */}
        <div className="traffic-light flex items-center gap-2 mr-4">
          <button
            onClick={handleClose}
            aria-label="Close window"
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 flex items-center justify-center group focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <span className="hidden group-hover:block text-[8px] text-black/50 leading-none">✕</span>
          </button>
          <button
            onClick={handleMinimize}
            aria-label="Minimize window"
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-90 flex items-center justify-center group focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <span className="hidden group-hover:block text-[8px] text-black/50 leading-none">−</span>
          </button>
          <button
            onClick={handleMaximize}
            aria-label="Maximize window"
            className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-90 flex items-center justify-center group focus-visible:ring-2 focus-visible:ring-green-400"
          >
            <span className="hidden group-hover:block text-[8px] text-black/50 leading-none">⤢</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 text-center text-xs text-gray-600 font-medium truncate">
          {windowState.title}
        </div>

        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {children}
      </div>

      {/* Resize handles */}
      <div className="absolute top-0 left-0 w-1 h-full cursor-w-resize" onMouseDown={(e) => handleResize(e, 'w')} />
      <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize" onMouseDown={(e) => handleResize(e, 'e')} />
      <div className="absolute bottom-0 left-0 h-1 w-full cursor-s-resize" onMouseDown={(e) => handleResize(e, 's')} />
      <div className="absolute top-0 left-0 h-1 w-full cursor-n-resize" onMouseDown={(e) => handleResize(e, 'n')} />
      <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={(e) => handleResize(e, 'se')} />
      <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={(e) => handleResize(e, 'sw')} />
      <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={(e) => handleResize(e, 'ne')} />
      <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={(e) => handleResize(e, 'nw')} />
    </div>
  );
}
