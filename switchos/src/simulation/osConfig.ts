import type { FileSystemState } from './fileSystem';
import { createDefaultMacFileSystem, createDefaultWindowsFileSystem, createDefaultLinuxFileSystem } from './fileSystem';
import type { ShortcutDefinition } from './keyboardHandler';
import { defaultMacShortcuts, defaultWindowsShortcuts, defaultLinuxShortcuts } from './keyboardHandler';

export type OSType = 'macos' | 'windows' | 'linux';

export interface OSConfig {
  desktopPath: string;
  defaultActiveApp: string;
  trashName: string;
  fileSystemFactory: () => FileSystemState;
  shortcuts: ShortcutDefinition[];
  formatDisplayPath: (internalPath: string) => string;
  menuBarHeight: number;
  taskbarHeight: number;
  formatShortcutKey: (key: string) => string;
}

export const OS_CONFIGS: Record<OSType, OSConfig> = {
  macos: {
    desktopPath: '/Users/you/Desktop',
    defaultActiveApp: 'finder',
    trashName: 'Trash',
    fileSystemFactory: createDefaultMacFileSystem,
    shortcuts: defaultMacShortcuts,
    formatDisplayPath: (path: string) => path,
    menuBarHeight: 28,
    taskbarHeight: 72,
    formatShortcutKey: (key: string) => {
      switch (key) {
        case 'Meta': return '⌘';
        case 'Shift': return '⇧';
        case 'Alt': return '⌥';
        case 'Control': return '⌃';
        case 'Backspace': return '⌫';
        case ' ': return 'Space';
        default: return key.toUpperCase();
      }
    },
  },
  windows: {
    desktopPath: '/Users/you/Desktop',
    defaultActiveApp: 'fileexplorer',
    trashName: 'Recycle Bin',
    fileSystemFactory: createDefaultWindowsFileSystem,
    shortcuts: defaultWindowsShortcuts,
    formatDisplayPath: (path: string) => {
      if (path === '/') return 'C:\\';
      return 'C:' + path.replace(/\//g, '\\');
    },
    menuBarHeight: 0,
    taskbarHeight: 48,
    formatShortcutKey: (key: string) => {
      switch (key) {
        case 'Meta': return 'Win';
        case 'Control': return 'Ctrl';
        case 'Alt': return 'Alt';
        case 'Shift': return 'Shift';
        case 'Backspace': return 'Backspace';
        case 'Delete': return 'Del';
        case ' ': return 'Space';
        default: return key.toUpperCase();
      }
    },
  },
  linux: {
    desktopPath: '/home/you/Desktop',
    defaultActiveApp: 'filemanager',
    trashName: 'Trash',
    fileSystemFactory: createDefaultLinuxFileSystem,
    shortcuts: defaultLinuxShortcuts,
    formatDisplayPath: (path: string) => path,
    menuBarHeight: 28,
    taskbarHeight: 0,
    formatShortcutKey: (key: string) => {
      switch (key) {
        case 'Meta': return 'Super';
        case 'Control': return 'Ctrl';
        case 'Alt': return 'Alt';
        case 'Shift': return 'Shift';
        case 'Backspace': return 'Backspace';
        case 'Delete': return 'Del';
        case ' ': return 'Space';
        default: return key.toUpperCase();
      }
    },
  },
};

export function getDesktopPath(osType: OSType): string {
  return OS_CONFIGS[osType].desktopPath;
}

export function getShortcutsForOS(osType: OSType): ShortcutDefinition[] {
  return OS_CONFIGS[osType].shortcuts;
}

export function formatShortcutDisplay(keys: string[], osType: OSType): string {
  const config = OS_CONFIGS[osType];
  return keys.map((k) => config.formatShortcutKey(k)).join(osType === 'macos' ? '' : '+');
}
