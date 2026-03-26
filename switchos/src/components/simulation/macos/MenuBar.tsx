'use client';

import { useSimulationStore } from '@/store/useSimulationStore';
import { useEffect, useState, useRef } from 'react';

interface MenuItem {
  label: string;
  action?: string;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

const MENU_DEFINITIONS: Record<string, Record<string, MenuItem[]>> = {
  finder: {
    File: [
      { label: 'New Finder Window', action: 'newFinderWindow', shortcut: '⌘N' },
      { label: 'New Folder', action: 'newFolder', shortcut: '⇧⌘N' },
      { label: '', separator: true },
      { label: 'Get Info', action: 'getInfo', shortcut: '⌘I', disabled: true },
      { label: '', separator: true },
      { label: 'Close Window', action: 'closeWindow', shortcut: '⌘W' },
    ],
    Edit: [
      { label: 'Undo', action: 'undo', shortcut: '⌘Z', disabled: true },
      { label: '', separator: true },
      { label: 'Copy', action: 'copy', shortcut: '⌘C' },
      { label: 'Paste', action: 'paste', shortcut: '⌘V' },
      { label: 'Select All', action: 'selectAll', shortcut: '⌘A' },
    ],
    View: [
      { label: 'as Icons', action: 'viewIcons' },
      { label: 'as List', action: 'viewList' },
      { label: 'as Columns', action: 'viewColumns', disabled: true },
    ],
    Go: [
      { label: 'Desktop', action: 'goDesktop' },
      { label: 'Documents', action: 'goDocuments' },
      { label: 'Downloads', action: 'goDownloads' },
      { label: 'Applications', action: 'goApplications' },
    ],
    Window: [
      { label: 'Minimize', action: 'minimize', shortcut: '⌘M' },
      { label: 'Zoom', action: 'zoom' },
    ],
    Help: [
      { label: 'Finder Help', action: 'help', disabled: true },
    ],
  },
  textedit: {
    File: [
      { label: 'New', action: 'new', shortcut: '⌘N' },
      { label: '', separator: true },
      { label: 'Close', action: 'closeWindow', shortcut: '⌘W' },
    ],
    Edit: [
      { label: 'Undo', action: 'undo', shortcut: '⌘Z' },
      { label: '', separator: true },
      { label: 'Cut', action: 'cut', shortcut: '⌘X' },
      { label: 'Copy', action: 'copy', shortcut: '⌘C' },
      { label: 'Paste', action: 'paste', shortcut: '⌘V' },
      { label: 'Select All', action: 'selectAll', shortcut: '⌘A' },
    ],
    Format: [
      { label: 'Bold', disabled: true },
      { label: 'Italic', disabled: true },
    ],
    View: [],
    Window: [
      { label: 'Minimize', action: 'minimize', shortcut: '⌘M' },
    ],
    Help: [],
  },
  terminal: {
    Shell: [
      { label: 'New Window', action: 'newTerminalWindow' },
      { label: '', separator: true },
      { label: 'Close', action: 'closeWindow', shortcut: '⌘W' },
    ],
    Edit: [
      { label: 'Copy', action: 'copy', shortcut: '⌘C' },
      { label: 'Paste', action: 'paste', shortcut: '⌘V' },
      { label: 'Select All', action: 'selectAll', shortcut: '⌘A' },
    ],
    View: [],
    Window: [
      { label: 'Minimize', action: 'minimize', shortcut: '⌘M' },
    ],
    Help: [],
  },
  settings: {
    'System Settings': [
      { label: 'Quit System Settings', action: 'quitApp', shortcut: '⌘Q' },
    ],
    View: [],
    Window: [
      { label: 'Minimize', action: 'minimize', shortcut: '⌘M' },
    ],
    Help: [],
  },
};

const MENU_NAMES: Record<string, string[]> = {
  finder: ['File', 'Edit', 'View', 'Go', 'Window', 'Help'],
  textedit: ['File', 'Edit', 'Format', 'View', 'Window', 'Help'],
  terminal: ['Shell', 'Edit', 'View', 'Window', 'Help'],
  settings: ['System Settings', 'View', 'Window', 'Help'],
};

export default function MenuBar() {
  const activeApp = useSimulationStore((s) => s.activeApp);
  const closeWindow = useSimulationStore((s) => s.closeWindow);
  const minimizeWindow = useSimulationStore((s) => s.minimizeWindow);
  const openWindow = useSimulationStore((s) => s.openWindow);
  const quitApp = useSimulationStore((s) => s.quitApp);
  const launchApp = useSimulationStore((s) => s.launchApp);
  const windowManager = useSimulationStore((s) => s.windowManager);
  const createFolder = useSimulationStore((s) => s.createFolder);
  const getNodeByPath = useSimulationStore((s) => s.getNodeByPath);
  const recordAction = useSimulationStore((s) => s.recordAction);

  const [time, setTime] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const appId = activeApp || 'finder';
  const appName = appId.charAt(0).toUpperCase() + appId.slice(1);
  const menuNames = MENU_NAMES[appId] || MENU_NAMES.finder;
  const menuDefs = MENU_DEFINITIONS[appId] || MENU_DEFINITIONS.finder;

  const handleMenuAction = (action?: string) => {
    if (!action) return;
    setOpenMenu(null);
    recordAction({ type: 'click', target: { elementType: 'menu-action' }, data: { text: action } });

    const focusedId = windowManager.focusedWindowId;
    switch (action) {
      case 'closeWindow':
        if (focusedId) closeWindow(focusedId);
        break;
      case 'minimize':
        if (focusedId) minimizeWindow(focusedId);
        break;
      case 'quitApp':
        quitApp(appId);
        break;
      case 'newFinderWindow':
        openWindow('finder');
        break;
      case 'newTerminalWindow':
        openWindow('terminal');
        break;
      case 'new':
        openWindow('textedit');
        break;
      case 'newFolder': {
        const desktop = getNodeByPath('/Users/you/Desktop');
        if (desktop) createFolder(desktop.id, 'untitled folder');
        break;
      }
      case 'goDesktop':
        launchApp('finder');
        break;
      case 'goDocuments':
        openWindow('finder', { meta: { path: '/Users/you/Documents' } });
        break;
      case 'goDownloads':
        openWindow('finder', { meta: { path: '/Users/you/Downloads' } });
        break;
      case 'goApplications':
        openWindow('finder', { meta: { path: '/Applications' } });
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-0 left-0 right-0 h-7 flex items-center px-2 z-[9999]"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.8)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
        fontSize: '13px',
      }}
    >
      {/* Apple logo */}
      <button
        className="px-3 py-0.5 hover:bg-black/5 rounded font-bold text-sm"
        aria-label="Apple menu"
        onClick={() => setOpenMenu(openMenu === 'apple' ? null : 'apple')}
      >

      </button>
      {openMenu === 'apple' && (
        <MenuDropdown
          items={[
            { label: 'About This Mac', action: 'aboutMac' },
            { label: '', separator: true },
            { label: 'System Settings...', action: 'openSettings' },
            { label: '', separator: true },
            { label: `Quit ${appName}`, action: 'quitApp', shortcut: '⌘Q' },
          ]}
          left={8}
          onAction={(action) => {
            setOpenMenu(null);
            if (action === 'openSettings') launchApp('settings');
            else if (action === 'aboutMac') launchApp('settings');
            else handleMenuAction(action);
          }}
        />
      )}

      {/* App name (bold) */}
      <button
        className="px-2 py-0.5 hover:bg-black/5 rounded font-semibold"
        onClick={() => setOpenMenu(openMenu === 'appName' ? null : 'appName')}
      >
        {appName}
      </button>

      {/* Menu items */}
      {menuNames.map((name) => (
        <div key={name} className="relative">
          <button
            className={`px-2 py-0.5 rounded ${openMenu === name ? 'bg-black/10' : 'hover:bg-black/5'}`}
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => { if (openMenu) setOpenMenu(name); }}
          >
            {name}
          </button>
          {openMenu === name && menuDefs[name] && menuDefs[name].length > 0 && (
            <MenuDropdown
              items={menuDefs[name]}
              left={0}
              onAction={handleMenuAction}
            />
          )}
        </div>
      ))}

      {/* Right side */}
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-xs">
        <span aria-label="Battery">🔋</span>
        <span aria-label="Wi-Fi">📶</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

function MenuDropdown({
  items,
  left,
  onAction,
}: {
  items: MenuItem[];
  left: number;
  onAction: (action?: string) => void;
}) {
  return (
    <div
      className="absolute top-full mt-0 rounded-lg py-1 min-w-[200px] z-[10000] animate-slideDown"
      style={{
        left,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 6px 30px rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px bg-gray-200 my-1 mx-2" />
        ) : (
          <button
            key={i}
            className="w-full text-left px-4 py-1 hover:bg-blue-500 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current flex justify-between items-center text-[13px]"
            disabled={item.disabled}
            onClick={() => onAction(item.action)}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400 ml-6">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
