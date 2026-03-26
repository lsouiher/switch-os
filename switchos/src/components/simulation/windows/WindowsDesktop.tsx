'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSimulationStore, ContextMenuItem } from '@/store/useSimulationStore';
import DesktopIcon from '../DesktopIcon';
import ContextMenu from '../ContextMenu';
import Window from '../Window';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import FileExplorer from './FileExplorer';
import Notepad from './Notepad';
import PowerShell from './PowerShell';
import CommandPrompt from './CommandPrompt';
import WindowsSettings from './WindowsSettings';
import SearchOverlay from './SearchOverlay';
import TaskManager from './TaskManager';
import { normalizeKey, matchShortcut } from '@/simulation/keyboardHandler';
import { getShortcutsForOS } from '@/simulation/osConfig';

const WALLPAPERS: Record<string, string> = {
  default: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
  bloom: 'linear-gradient(135deg, #1e3a5f 0%, #0078d4 50%, #00bcf2 100%)',
  flow: 'linear-gradient(135deg, #2d1b69 0%, #6b2fa0 50%, #c239b3 100%)',
  sunrise: 'linear-gradient(135deg, #f5734a 0%, #da2c38 50%, #1e1e2e 100%)',
};

function WindowsAppContent({ appId, windowId }: { appId: string; windowId: string }) {
  switch (appId) {
    case 'fileexplorer': return <FileExplorer windowId={windowId} />;
    case 'notepad': return <Notepad windowId={windowId} />;
    case 'powershell': return <PowerShell windowId={windowId} />;
    case 'cmd': return <CommandPrompt windowId={windowId} />;
    case 'winsettings': return <WindowsSettings />;
    case 'taskmanager': return <TaskManager />;
    default: return <div className="flex items-center justify-center h-full text-gray-400">App not available</div>;
  }
}

export default function WindowsDesktop() {
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
  const quitApp = useSimulationStore((s) => s.quitApp);
  const createFolder = useSimulationStore((s) => s.createFolder);
  const getNodeByPath = useSimulationStore((s) => s.getNodeByPath);
  const startEditingIcon = useSimulationStore((s) => s.startEditingIcon);
  const deleteNode = useSimulationStore((s) => s.deleteNode);
  const setClipboard = useSimulationStore((s) => s.setClipboard);
  const pasteClipboard = useSimulationStore((s) => s.pasteClipboard);
  const launchApp = useSimulationStore((s) => s.launchApp);
  const selectedIcons = desktopIcons.filter((i) => i.selected);

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const shortcuts = getShortcutsForOS('windows');

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
          case 'search':
            toggleSpotlight();
            break;
          case 'startMenu':
            setStartMenuOpen((v) => !v);
            break;
          case 'openFileExplorer':
            launchApp('fileexplorer');
            break;
          case 'closeWindow': {
            const focusedId = useSimulationStore.getState().windowManager.focusedWindowId;
            if (focusedId) closeWindow(focusedId);
            break;
          }
          case 'quitApp': {
            const activeApp = useSimulationStore.getState().activeApp;
            if (activeApp) quitApp(activeApp);
            break;
          }
          case 'newFolder': {
            const desktop = getNodeByPath('/Users/you/Desktop');
            if (desktop) {
              const node = createFolder(desktop.id, 'New folder');
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
  }, [addPressedKey, removePressedKey, clearPressedKeys, recordAction, toggleSpotlight, closeWindow, quitApp, createFolder, getNodeByPath, startEditingIcon, deleteNode, setClipboard, pasteClipboard, launchApp, selectedIcons, shortcuts]);

  // Context menu action handler
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const desktop = getNodeByPath('/Users/you/Desktop');
      switch (action) {
        case 'newFolder':
          if (desktop) {
            const node = createFolder(desktop.id, 'New folder');
            startEditingIcon(node.id);
          }
          break;
      }
    };
    document.addEventListener('contextmenu-action', handler);
    return () => document.removeEventListener('contextmenu-action', handler);
  }, [createFolder, getNodeByPath, startEditingIcon]);

  const handleDesktopClick = useCallback(() => {
    deselectAllIcons();
    hideContextMenu();
    setStartMenuOpen(false);
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
        { label: 'View', action: 'view', disabled: true },
        { label: 'Sort by', action: 'sortBy', disabled: true },
        { label: '', action: '', separator: true },
        { label: 'New Folder', action: 'newFolder', shortcut: 'Ctrl+Shift+N' },
        { label: '', action: '', separator: true },
        { label: 'Display settings', action: 'displaySettings', disabled: true },
        { label: 'Personalize', action: 'personalize', disabled: true },
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
      style={{ background: bg, fontFamily: '"Segoe UI", sans-serif' }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Icons */}
      {desktopIcons.map((icon) => (
        <DesktopIcon key={icon.nodeId} {...icon} />
      ))}

      {/* Windows */}
      {sortedWindows.map((win) => (
        <Window key={win.id} windowId={win.id}>
          <WindowsAppContent appId={win.appId} windowId={win.id} />
        </Window>
      ))}

      <ContextMenu />

      {/* Search overlay */}
      {spotlightOpen && <SearchOverlay />}

      {/* Start Menu */}
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}

      {/* Taskbar */}
      <Taskbar
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        startMenuOpen={startMenuOpen}
      />
    </div>
  );
}
