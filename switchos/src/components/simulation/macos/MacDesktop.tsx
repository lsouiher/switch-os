'use client';

import React, { useCallback, useEffect } from 'react';
import { useSimulationStore, ContextMenuItem } from '@/store/useSimulationStore';
import MenuBar from './MenuBar';
import Dock from './Dock';
import DesktopIcon from '../DesktopIcon';
import ContextMenu from '../ContextMenu';
import Window from '../Window';
import Finder from './Finder';
import TextEdit from './TextEdit';
import Terminal from './Terminal';
import SystemSettings from './SystemSettings';
import Spotlight from './Spotlight';
import { normalizeKey, matchShortcut } from '@/simulation/keyboardHandler';
import { getShortcutsForOS } from '@/simulation/osConfig';

const WALLPAPERS: Record<string, string> = {
  default: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  monterey: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
  ventura: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)',
  sonoma: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)',
};

function MacAppContent({ appId, windowId }: { appId: string; windowId: string }) {
  switch (appId) {
    case 'finder': return <Finder windowId={windowId} />;
    case 'textedit': return <TextEdit windowId={windowId} />;
    case 'terminal': return <Terminal windowId={windowId} />;
    case 'settings': return <SystemSettings />;
    default: return <div className="flex items-center justify-center h-full text-gray-400">App not available</div>;
  }
}

export default function MacDesktop() {
  const desktopIcons = useSimulationStore((s) => s.desktopIcons);
  const windows = useSimulationStore((s) => s.windowManager.windows);
  const wallpaper = useSimulationStore((s) => s.wallpaper);
  const deselectAllIcons = useSimulationStore((s) => s.deselectAllIcons);
  const hideContextMenu = useSimulationStore((s) => s.hideContextMenu);
  const showContextMenu = useSimulationStore((s) => s.showContextMenu);
  const recordAction = useSimulationStore((s) => s.recordAction);
  const addPressedKey = useSimulationStore((s) => s.addPressedKey);
  const removePressedKey = useSimulationStore((s) => s.removePressedKey);
  const clearPressedKeys = useSimulationStore((s) => s.clearPressedKeys);
  const spotlightOpen = useSimulationStore((s) => s.spotlightOpen);
  const toggleSpotlight = useSimulationStore((s) => s.toggleSpotlight);
  const closeSpotlight = useSimulationStore((s) => s.closeSpotlight);
  const closeWindow = useSimulationStore((s) => s.closeWindow);
  const createFolder = useSimulationStore((s) => s.createFolder);
  const getNodeByPath = useSimulationStore((s) => s.getNodeByPath);
  const startEditingIcon = useSimulationStore((s) => s.startEditingIcon);
  const deleteNode = useSimulationStore((s) => s.deleteNode);
  const setClipboard = useSimulationStore((s) => s.setClipboard);
  const pasteClipboard = useSimulationStore((s) => s.pasteClipboard);
  const selectedIcons = desktopIcons.filter((i) => i.selected);

  const shortcuts = getShortcutsForOS('macos');

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = normalizeKey(e);
      addPressedKey(key);

      const pressed = new Set<string>();
      if (e.metaKey) pressed.add('Meta');
      if (e.ctrlKey) pressed.add('Control');
      if (e.shiftKey) pressed.add('Shift');
      if (e.altKey) pressed.add('Alt');
      if (!['Meta', 'Control', 'Shift', 'Alt'].includes(key)) pressed.add(key);

      const shortcut = matchShortcut(pressed, shortcuts);
      if (shortcut) {
        e.preventDefault();
        recordAction({
          type: 'shortcut',
          target: {},
          data: { shortcut: shortcut.keys },
        });

        switch (shortcut.action) {
          case 'spotlight':
            toggleSpotlight();
            break;
          case 'closeWindow': {
            const focusedId = useSimulationStore.getState().windowManager.focusedWindowId;
            if (focusedId) closeWindow(focusedId);
            break;
          }
          case 'newFolder': {
            const desktop = getNodeByPath('/Users/you/Desktop');
            if (desktop) {
              const node = createFolder(desktop.id, 'untitled folder');
              startEditingIcon(node.id);
            }
            break;
          }
          case 'moveToTrash': {
            for (const icon of selectedIcons) {
              deleteNode(icon.nodeId);
            }
            break;
          }
          case 'copy': {
            const ids = selectedIcons.map((i) => i.nodeId);
            if (ids.length > 0) setClipboard('copy', ids);
            break;
          }
          case 'cut': {
            const ids = selectedIcons.map((i) => i.nodeId);
            if (ids.length > 0) setClipboard('cut', ids);
            break;
          }
          case 'paste': {
            const desktop = getNodeByPath('/Users/you/Desktop');
            if (desktop) pasteClipboard(desktop.id);
            break;
          }
          case 'selectAll': {
            break;
          }
          case 'undo': {
            break;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      removePressedKey(normalizeKey(e));
    };

    const handleBlur = () => {
      clearPressedKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [addPressedKey, removePressedKey, clearPressedKeys, recordAction, toggleSpotlight, closeWindow, createFolder, getNodeByPath, startEditingIcon, deleteNode, setClipboard, pasteClipboard, selectedIcons, shortcuts]);

  // Context menu action handler
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const desktop = getNodeByPath('/Users/you/Desktop');
      switch (action) {
        case 'newFolder':
          if (desktop) {
            const node = createFolder(desktop.id, 'untitled folder');
            startEditingIcon(node.id);
          }
          break;
        case 'getInfo':
          break;
        case 'changeWallpaper':
          break;
      }
    };
    document.addEventListener('contextmenu-action', handler);
    return () => document.removeEventListener('contextmenu-action', handler);
  }, [createFolder, getNodeByPath, startEditingIcon]);

  const handleDesktopClick = useCallback(() => {
    deselectAllIcons();
    hideContextMenu();
    if (spotlightOpen) closeSpotlight();
  }, [deselectAllIcons, hideContextMenu, spotlightOpen, closeSpotlight]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      recordAction({
        type: 'right-click',
        target: { elementType: 'desktop', coordinates: { x: e.clientX, y: e.clientY } },
      });

      const items: ContextMenuItem[] = [
        { label: 'New Folder', action: 'newFolder', shortcut: '⇧⌘N' },
        { label: 'Get Info', action: 'getInfo', shortcut: '⌘I', disabled: true },
        { label: '', action: '', separator: true },
        { label: 'Change Wallpaper...', action: 'changeWallpaper' },
        { label: '', action: '', separator: true },
        { label: 'Sort By', action: 'sortBy', disabled: true },
        { label: 'Clean Up', action: 'cleanUp', disabled: true },
      ];

      showContextMenu(e.clientX, e.clientY, items);
    },
    [showContextMenu, recordAction]
  );

  const bg = WALLPAPERS[wallpaper] || WALLPAPERS.default;

  const sortedWindows = Object.values(windows)
    .filter((w) => !w.isMinimized)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      <MenuBar />

      {/* Desktop Icons */}
      {desktopIcons.map((icon) => (
        <DesktopIcon key={icon.nodeId} {...icon} />
      ))}

      {/* Windows */}
      {sortedWindows.map((win) => (
        <Window key={win.id} windowId={win.id}>
          <MacAppContent appId={win.appId} windowId={win.id} />
        </Window>
      ))}

      <Dock />
      <ContextMenu />

      {/* Spotlight */}
      {spotlightOpen && <Spotlight />}
    </div>
  );
}
