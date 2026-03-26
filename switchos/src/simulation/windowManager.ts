import { v4 as uuidv4 } from 'uuid';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  meta?: Record<string, unknown>;
}

export interface WindowManagerState {
  windows: Record<string, WindowState>;
  focusedWindowId: string | null;
  nextZIndex: number;
}

export function createWindowManagerState(): WindowManagerState {
  return {
    windows: {},
    focusedWindowId: null,
    nextZIndex: 1,
  };
}

const APP_DEFAULTS: Record<string, Partial<WindowState>> = {
  // macOS apps
  finder: { title: 'Finder', width: 800, height: 500, minWidth: 400, minHeight: 300 },
  textedit: { title: 'Untitled', width: 600, height: 400, minWidth: 300, minHeight: 200 },
  terminal: { title: 'Terminal', width: 640, height: 400, minWidth: 400, minHeight: 250 },
  settings: { title: 'System Settings', width: 700, height: 500, minWidth: 500, minHeight: 400 },
  spotlight: { title: 'Spotlight', width: 600, height: 60, minWidth: 600, minHeight: 60 },
  // Windows apps
  fileexplorer: { title: 'File Explorer', width: 800, height: 500, minWidth: 400, minHeight: 300 },
  notepad: { title: 'Untitled - Notepad', width: 600, height: 400, minWidth: 300, minHeight: 200 },
  powershell: { title: 'Windows PowerShell', width: 680, height: 420, minWidth: 400, minHeight: 250 },
  cmd: { title: 'Command Prompt', width: 680, height: 420, minWidth: 400, minHeight: 250 },
  winsettings: { title: 'Settings', width: 700, height: 500, minWidth: 500, minHeight: 400 },
  search: { title: 'Search', width: 600, height: 60, minWidth: 600, minHeight: 60 },
  taskmanager: { title: 'Task Manager', width: 550, height: 400, minWidth: 400, minHeight: 300 },
};

export function openWindow(
  state: WindowManagerState,
  appId: string,
  overrides?: Partial<WindowState>
): { state: WindowManagerState; windowId: string } {
  const defaults = APP_DEFAULTS[appId] || { title: appId, width: 600, height: 400, minWidth: 300, minHeight: 200 };
  const id = uuidv4();
  const offset = Object.keys(state.windows).length * 30;

  const window: WindowState = {
    id,
    appId,
    title: defaults.title || appId,
    x: 100 + offset,
    y: 50 + offset,
    width: defaults.width || 600,
    height: defaults.height || 400,
    minWidth: defaults.minWidth || 300,
    minHeight: defaults.minHeight || 200,
    isMinimized: false,
    isMaximized: false,
    isFocused: true,
    zIndex: state.nextZIndex,
    ...overrides,
  };

  // Unfocus all other windows
  const windows = { ...state.windows };
  for (const key of Object.keys(windows)) {
    if (windows[key].isFocused) {
      windows[key] = { ...windows[key], isFocused: false };
    }
  }
  windows[id] = window;

  return {
    state: {
      windows,
      focusedWindowId: id,
      nextZIndex: state.nextZIndex + 1,
    },
    windowId: id,
  };
}

export function closeWindow(
  state: WindowManagerState,
  windowId: string
): WindowManagerState {
  const { [windowId]: _, ...rest } = state.windows;
  const remainingWindows = Object.values(rest);
  const topWindow = remainingWindows.length > 0
    ? remainingWindows.reduce((a, b) => (a.zIndex > b.zIndex ? a : b))
    : null;

  const windows = { ...rest };
  if (topWindow) {
    windows[topWindow.id] = { ...topWindow, isFocused: true };
  }

  return {
    windows,
    focusedWindowId: topWindow?.id || null,
    nextZIndex: state.nextZIndex,
  };
}

export function focusWindow(
  state: WindowManagerState,
  windowId: string
): WindowManagerState {
  const windows = { ...state.windows };
  for (const key of Object.keys(windows)) {
    windows[key] = { ...windows[key], isFocused: key === windowId };
  }
  if (windows[windowId]) {
    windows[windowId] = {
      ...windows[windowId],
      zIndex: state.nextZIndex,
      isFocused: true,
      isMinimized: false,
    };
  }

  return {
    windows,
    focusedWindowId: windowId,
    nextZIndex: state.nextZIndex + 1,
  };
}

export function minimizeWindow(
  state: WindowManagerState,
  windowId: string
): WindowManagerState {
  const windows = { ...state.windows };
  windows[windowId] = { ...windows[windowId], isMinimized: true, isFocused: false };

  const visible = Object.values(windows).filter((w) => !w.isMinimized);
  const topWindow = visible.length > 0
    ? visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b))
    : null;

  if (topWindow) {
    windows[topWindow.id] = { ...topWindow, isFocused: true };
  }

  return {
    windows,
    focusedWindowId: topWindow?.id || null,
    nextZIndex: state.nextZIndex,
  };
}

export function maximizeWindow(
  state: WindowManagerState,
  windowId: string
): WindowManagerState {
  const win = state.windows[windowId];
  if (!win) return state;

  return {
    ...state,
    windows: {
      ...state.windows,
      [windowId]: {
        ...win,
        isMaximized: !win.isMaximized,
        ...(win.isMaximized
          ? {} // Will restore via stored pre-maximize state in component
          : { x: 0, y: 28, width: window?.innerWidth || 1280, height: (window?.innerHeight || 720) - 28 - 72 }),
      },
    },
  };
}

export function moveWindow(
  state: WindowManagerState,
  windowId: string,
  x: number,
  y: number
): WindowManagerState {
  const win = state.windows[windowId];
  if (!win) return state;
  return {
    ...state,
    windows: {
      ...state.windows,
      [windowId]: { ...win, x, y, isMaximized: false },
    },
  };
}

export function resizeWindow(
  state: WindowManagerState,
  windowId: string,
  width: number,
  height: number
): WindowManagerState {
  const win = state.windows[windowId];
  if (!win) return state;
  return {
    ...state,
    windows: {
      ...state.windows,
      [windowId]: {
        ...win,
        width: Math.max(width, win.minWidth),
        height: Math.max(height, win.minHeight),
        isMaximized: false,
      },
    },
  };
}

export function getWindowsForApp(
  state: WindowManagerState,
  appId: string
): WindowState[] {
  return Object.values(state.windows).filter((w) => w.appId === appId);
}

export function updateWindowTitle(
  state: WindowManagerState,
  windowId: string,
  title: string
): WindowManagerState {
  const win = state.windows[windowId];
  if (!win) return state;
  return {
    ...state,
    windows: {
      ...state.windows,
      [windowId]: { ...win, title },
    },
  };
}
