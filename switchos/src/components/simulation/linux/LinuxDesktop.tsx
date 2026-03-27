'use client';

import React, { useCallback, useEffect } from 'react';
import { useSimulationStore, ContextMenuItem } from '@/store/useSimulationStore';
import TopBar from './TopBar';
import GnomeDock from './GnomeDock';
import DesktopIcon from '../DesktopIcon';
import ContextMenu from '../ContextMenu';
import Window from '../Window';
import FileManager from './FileManager';
import TextEditor from './TextEditor';
import LinuxTerminal from './LinuxTerminal';
import LinuxSettings from './LinuxSettings';
import ActivitiesOverview from './ActivitiesOverview';
import { normalizeKey, matchShortcut } from '@/simulation/keyboardHandler';
import { getShortcutsForOS } from '@/simulation/osConfig';

const WALLPAPERS: Record<string, string> = {
  default: 'linear-gradient(135deg, #2c001e 0%, #5e2750 50%, #e95420 100%)',
  jammy: 'linear-gradient(135deg, #e95420 0%, #c7451e 50%, #77216f 100%)',
  noble: 'linear-gradient(135deg, #77216f 0%, #5e2750 50%, #2c001e 100%)',
  teal: 'linear-gradient(135deg, #0e8a7b 0%, #065f46 50%, #064e3b 100%)',
};

function LinuxAppContent({ appId, windowId }: { appId: string; windowId: string }) {
  switch (appId) {
    case 'filemanager': return <FileManager windowId={windowId} />;
    case 'texteditor': return <TextEditor windowId={windowId} />;
    case 'linuxterminal': return <LinuxTerminal windowId={windowId} />;
    case 'linuxsettings': return <LinuxSettings />;
    default: return <div className="flex items-center justify-center h-full text-gray-400">App not available</div>;
  }
}

export default function LinuxDesktop() {
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
  const launchApp = useSimulationStore((s) => s.launchApp);
  const selectedIcons = desktopIcons.filter((i) => i.selected);

  const shortcuts = getShortcutsForOS('linux');

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
          case 'activities':
            toggleSpotlight();
            break;
          case 'openTerminal':
            launchApp('linuxterminal');
            break;
          case 'closeWindow': {
            const focusedId = useSimulationStore.getState().windowManager.focusedWindowId;
            if (focusedId) closeWindow(focusedId);
            break;
          }
          case 'newFolder': {
            const desktop = getNodeByPath('/home/you/Desktop');
            if (desktop) {
              const node = createFolder(desktop.id, 'New Folder');
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
            const desktop = getNodeByPath('/home/you/Desktop');
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
  }, [addPressedKey, removePressedKey, clearPressedKeys, recordAction, toggleSpotlight, closeWindow, createFolder, getNodeByPath, startEditingIcon, deleteNode, setClipboard, pasteClipboard, launchApp, selectedIcons, shortcuts]);

  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const desktop = getNodeByPath('/home/you/Desktop');
      switch (action) {
        case 'newFolder':
          if (desktop) {
            const node = createFolder(desktop.id, 'New Folder');
            startEditingIcon(node.id);
          }
          break;
        case 'changeWallpaper':
          launchApp('linuxsettings');
          break;
      }
    };
    document.addEventListener('contextmenu-action', handler);
    return () => document.removeEventListener('contextmenu-action', handler);
  }, [createFolder, getNodeByPath, startEditingIcon, launchApp]);

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
        { label: 'New Folder', action: 'newFolder', shortcut: 'Ctrl+Shift+N' },
        { label: '', action: '', separator: true },
        { label: 'Change Background...', action: 'changeWallpaper' },
        { label: '', action: '', separator: true },
        { label: 'Display Settings', action: 'displaySettings', disabled: true },
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
      style={{ background: bg, fontFamily: '"Ubuntu", "Cantarell", sans-serif' }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      <TopBar />

      {/* Desktop Icons — offset for dock on left */}
      <div className="absolute top-8 left-16 right-0 bottom-0">
        {desktopIcons.map((icon) => (
          <DesktopIcon key={icon.nodeId} {...icon} />
        ))}
      </div>

      {/* Windows */}
      {sortedWindows.map((win) => (
        <Window key={win.id} windowId={win.id}>
          <LinuxAppContent appId={win.appId} windowId={win.id} />
        </Window>
      ))}

      <GnomeDock />
      <ContextMenu />

      {/* Activities Overview */}
      {spotlightOpen && <ActivitiesOverview />}
    </div>
  );
}
