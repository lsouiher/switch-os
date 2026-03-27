export interface ShortcutDefinition {
  keys: string[];
  action: string;
  context?: string;
  description: string;
}

export const defaultMacShortcuts: ShortcutDefinition[] = [
  { keys: ['Meta', 'c'], action: 'copy', description: 'Copy' },
  { keys: ['Meta', 'v'], action: 'paste', description: 'Paste' },
  { keys: ['Meta', 'x'], action: 'cut', description: 'Cut' },
  { keys: ['Meta', 'z'], action: 'undo', description: 'Undo' },
  { keys: ['Meta', 'a'], action: 'selectAll', description: 'Select All' },
  { keys: ['Meta', 'n'], action: 'new', description: 'New' },
  { keys: ['Meta', 'w'], action: 'closeWindow', description: 'Close Window' },
  { keys: ['Meta', 'q'], action: 'quitApp', description: 'Quit App' },
  { keys: ['Meta', ' '], action: 'spotlight', description: 'Spotlight Search' },
  { keys: ['Meta', 'Tab'], action: 'appSwitch', description: 'Switch App' },
  { keys: ['Meta', 'Backspace'], action: 'moveToTrash', description: 'Move to Trash' },
  { keys: ['Meta', 'Shift', 'n'], action: 'newFolder', description: 'New Folder' },
  { keys: ['Meta', 'Shift', 'Backspace'], action: 'emptyTrash', description: 'Empty Trash' },
  { keys: ['Meta', 'd'], action: 'duplicate', description: 'Duplicate' },
  { keys: ['Meta', 'i'], action: 'getInfo', description: 'Get Info' },
  { keys: ['Meta', 'f'], action: 'find', description: 'Find' },
  { keys: ['Meta', ','], action: 'preferences', description: 'Preferences' },
];

export const defaultWindowsShortcuts: ShortcutDefinition[] = [
  { keys: ['Control', 'c'], action: 'copy', description: 'Copy' },
  { keys: ['Control', 'v'], action: 'paste', description: 'Paste' },
  { keys: ['Control', 'x'], action: 'cut', description: 'Cut' },
  { keys: ['Control', 'z'], action: 'undo', description: 'Undo' },
  { keys: ['Control', 'a'], action: 'selectAll', description: 'Select All' },
  { keys: ['Control', 'n'], action: 'new', description: 'New' },
  { keys: ['Control', 'w'], action: 'closeWindow', description: 'Close Window' },
  { keys: ['Alt', 'F4'], action: 'quitApp', description: 'Close App' },
  { keys: ['Meta', 'e'], action: 'openFileExplorer', description: 'Open File Explorer' },
  { keys: ['Meta', 's'], action: 'search', description: 'Search' },
  { keys: ['Control', 'Shift', 'n'], action: 'newFolder', description: 'New Folder' },
  { keys: ['Delete'], action: 'moveToTrash', description: 'Delete' },
  { keys: ['Control', 'd'], action: 'duplicate', description: 'Duplicate' },
  { keys: ['Control', 'f'], action: 'find', description: 'Find' },
  { keys: ['F2'], action: 'rename', description: 'Rename' },
  { keys: ['Meta'], action: 'startMenu', description: 'Start Menu' },
];

export const defaultLinuxShortcuts: ShortcutDefinition[] = [
  { keys: ['Control', 'c'], action: 'copy', description: 'Copy' },
  { keys: ['Control', 'v'], action: 'paste', description: 'Paste' },
  { keys: ['Control', 'x'], action: 'cut', description: 'Cut' },
  { keys: ['Control', 'z'], action: 'undo', description: 'Undo' },
  { keys: ['Control', 'a'], action: 'selectAll', description: 'Select All' },
  { keys: ['Control', 'n'], action: 'new', description: 'New' },
  { keys: ['Control', 'w'], action: 'closeWindow', description: 'Close Window' },
  { keys: ['Alt', 'F4'], action: 'quitApp', description: 'Close App' },
  { keys: ['Control', 'Alt', 't'], action: 'openTerminal', description: 'Open Terminal' },
  { keys: ['Meta'], action: 'activities', description: 'Activities Overview' },
  { keys: ['Control', 'Shift', 'n'], action: 'newFolder', description: 'New Folder' },
  { keys: ['Delete'], action: 'moveToTrash', description: 'Move to Trash' },
  { keys: ['Control', 'd'], action: 'duplicate', description: 'Duplicate' },
  { keys: ['Control', 'f'], action: 'find', description: 'Find' },
  { keys: ['F2'], action: 'rename', description: 'Rename' },
  { keys: ['Control', 'l'], action: 'openLocation', description: 'Open Location Bar' },
];

export function matchShortcut(
  pressedKeys: Set<string>,
  shortcuts: ShortcutDefinition[],
  context?: string
): ShortcutDefinition | null {
  for (const shortcut of shortcuts) {
    // Context filter
    if (shortcut.context && shortcut.context !== context) continue;

    // Check all shortcut keys are pressed
    const allPressed = shortcut.keys.every((key) => {
      const normalizedKey = key.toLowerCase();
      for (const pressed of pressedKeys) {
        if (pressed.toLowerCase() === normalizedKey) return true;
      }
      return false;
    });

    // Check pressed count matches (avoid Cmd+C matching Cmd+Shift+C)
    if (allPressed && pressedKeys.size === shortcut.keys.length) {
      return shortcut;
    }
  }
  return null;
}

export function normalizeKey(event: KeyboardEvent): string {
  if (event.key === 'Meta' || event.key === 'OS') return 'Meta';
  if (event.key === 'Control') return 'Control';
  if (event.key === 'Alt') return 'Alt';
  if (event.key === 'Shift') return 'Shift';
  return event.key;
}
