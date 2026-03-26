import { create } from 'zustand';
import {
  FileSystemState,
  FileSystemNode,
  createDefaultMacFileSystem,
  createFile,
  createFolder,
  renameNode,
  moveNode,
  copyNode,
  deleteNode,
  permanentDeleteNode,
  getNodeByPath,
  getNodePath,
  getChildren,
  findByName,
} from '@/simulation/fileSystem';
import {
  WindowManagerState,
  WindowState,
  createWindowManagerState,
  openWindow,
  closeWindow,
  focusWindow,
  minimizeWindow,
  maximizeWindow,
  moveWindow as wmMoveWindow,
  resizeWindow as wmResizeWindow,
  updateWindowTitle,
  getWindowsForApp,
} from '@/simulation/windowManager';
import {
  ActionRecorderState,
  createActionRecorderState,
  recordAction,
  UserAction,
} from '@/simulation/actionRecorder';
import {
  matchShortcut,
  defaultMacShortcuts,
  ShortcutDefinition,
} from '@/simulation/keyboardHandler';

export interface DesktopIconState {
  nodeId: string;
  x: number;
  y: number;
  selected: boolean;
  editing: boolean;
}

export interface ContextMenuItem {
  label: string;
  action: string;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

export interface LessonState {
  currentLessonId: string | null;
  currentStepIndex: number;
  completedSteps: Set<string>;
  hintVisible: boolean;
  lessonComplete: boolean;
}

export interface SimulationStore {
  // File system
  fileSystem: FileSystemState;
  createFile: (parentId: string, name: string, content?: string) => FileSystemNode;
  createFolder: (parentId: string, name: string) => FileSystemNode;
  renameNode: (nodeId: string, newName: string) => void;
  moveNode: (nodeId: string, newParentId: string) => void;
  copyNode: (nodeId: string, newParentId: string) => string;
  deleteNode: (nodeId: string) => void;
  permanentDeleteNode: (nodeId: string) => void;
  emptyTrash: () => void;
  getNodeByPath: (path: string) => FileSystemNode | null;
  getNodePath: (nodeId: string) => string;
  getChildren: (nodeId: string) => FileSystemNode[];
  findByName: (name: string) => FileSystemNode[];
  setFileContent: (nodeId: string, content: string) => void;

  // Window management
  windowManager: WindowManagerState;
  openWindow: (appId: string, overrides?: Partial<WindowState>) => string;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  moveWindowTo: (windowId: string, x: number, y: number) => void;
  resizeWindowTo: (windowId: string, width: number, height: number) => void;
  updateWindowTitle: (windowId: string, title: string) => void;
  getWindowsForApp: (appId: string) => WindowState[];

  // Desktop
  desktopIcons: DesktopIconState[];
  setDesktopIcons: (icons: DesktopIconState[]) => void;
  selectDesktopIcon: (nodeId: string) => void;
  deselectAllIcons: () => void;
  startEditingIcon: (nodeId: string) => void;
  stopEditingIcon: () => void;
  moveDesktopIcon: (nodeId: string, x: number, y: number) => void;
  refreshDesktopIcons: () => void;

  // Context menu
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;

  // Clipboard
  clipboard: { type: 'cut' | 'copy'; nodeIds: string[] } | null;
  setClipboard: (type: 'cut' | 'copy', nodeIds: string[]) => void;
  pasteClipboard: (targetFolderId: string) => void;

  // Running apps
  runningApps: Set<string>;
  launchApp: (appId: string) => string;
  quitApp: (appId: string) => void;

  // Active app
  activeApp: string | null;

  // Keyboard
  pressedKeys: Set<string>;
  addPressedKey: (key: string) => void;
  removePressedKey: (key: string) => void;
  clearPressedKeys: () => void;
  handleShortcut: () => ShortcutDefinition | null;

  // Action recorder
  actionRecorder: ActionRecorderState;
  recordAction: (action: Omit<UserAction, 'id' | 'timestamp'>) => void;

  // Lesson state
  lesson: LessonState;
  setCurrentLesson: (lessonId: string | null) => void;
  advanceStep: () => void;
  completeStep: (stepId: string) => void;
  showHint: () => void;
  hideHint: () => void;
  setLessonComplete: (complete: boolean) => void;
  resetLesson: () => void;

  // Wallpaper
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;

  // Spotlight
  spotlightOpen: boolean;
  toggleSpotlight: () => void;
  closeSpotlight: () => void;

  // Reset
  resetSimulation: () => void;
  loadState: (fileSystem: FileSystemState) => void;
}

function buildDesktopIcons(fs: FileSystemState): DesktopIconState[] {
  const desktopNode = getNodeByPath(fs, '/Users/you/Desktop');
  if (!desktopNode) return [];
  const GRID_X = 80;
  const GRID_Y = 90;
  const COLS = 1;
  return desktopNode.children.map((id, i) => ({
    nodeId: id,
    x: 20 + (Math.floor(i / 8) * GRID_X),
    y: 40 + ((i % 8) * GRID_Y),
    selected: false,
    editing: false,
  }));
}

export const useSimulationStore = create<SimulationStore>((set, get) => {
  const initialFs = createDefaultMacFileSystem();

  return {
    // File system
    fileSystem: initialFs,
    createFile: (parentId, name, content) => {
      const result = createFile(get().fileSystem, parentId, name, content);
      set({ fileSystem: result.state });
      get().refreshDesktopIcons();
      return result.node;
    },
    createFolder: (parentId, name) => {
      const result = createFolder(get().fileSystem, parentId, name);
      set({ fileSystem: result.state });
      get().refreshDesktopIcons();
      return result.node;
    },
    renameNode: (nodeId, newName) => {
      set({ fileSystem: renameNode(get().fileSystem, nodeId, newName) });
    },
    moveNode: (nodeId, newParentId) => {
      set({ fileSystem: moveNode(get().fileSystem, nodeId, newParentId) });
      get().refreshDesktopIcons();
    },
    copyNode: (nodeId, newParentId) => {
      const result = copyNode(get().fileSystem, nodeId, newParentId);
      set({ fileSystem: result.state });
      get().refreshDesktopIcons();
      return result.newNodeId;
    },
    deleteNode: (nodeId) => {
      set({ fileSystem: deleteNode(get().fileSystem, nodeId) });
      get().refreshDesktopIcons();
    },
    permanentDeleteNode: (nodeId) => {
      set({ fileSystem: permanentDeleteNode(get().fileSystem, nodeId) });
    },
    emptyTrash: () => {
      const fs = get().fileSystem;
      const trash = fs.nodes[fs.trashId];
      let newFs = fs;
      for (const childId of [...trash.children]) {
        newFs = permanentDeleteNode(newFs, childId);
      }
      set({ fileSystem: newFs });
    },
    getNodeByPath: (path) => getNodeByPath(get().fileSystem, path),
    getNodePath: (nodeId) => getNodePath(get().fileSystem, nodeId),
    getChildren: (nodeId) => getChildren(get().fileSystem, nodeId),
    findByName: (name) => findByName(get().fileSystem, name),
    setFileContent: (nodeId, content) => {
      const fs = get().fileSystem;
      const node = fs.nodes[nodeId];
      if (!node) return;
      set({
        fileSystem: {
          ...fs,
          nodes: {
            ...fs.nodes,
            [nodeId]: { ...node, content, size: content.length, modifiedAt: Date.now() },
          },
        },
      });
    },

    // Window management
    windowManager: createWindowManagerState(),
    openWindow: (appId, overrides) => {
      const result = openWindow(get().windowManager, appId, overrides);
      set({
        windowManager: result.state,
        runningApps: new Set([...get().runningApps, appId]),
        activeApp: appId,
      });
      return result.windowId;
    },
    closeWindow: (windowId) => {
      const win = get().windowManager.windows[windowId];
      const newState = closeWindow(get().windowManager, windowId);
      set({ windowManager: newState });
      // If no more windows for that app, remove from running
      if (win && getWindowsForApp(newState, win.appId).length === 0) {
        const apps = new Set(get().runningApps);
        apps.delete(win.appId);
        set({ runningApps: apps });
      }
      // Update active app
      if (newState.focusedWindowId) {
        set({ activeApp: newState.windows[newState.focusedWindowId]?.appId || null });
      } else {
        set({ activeApp: 'finder' });
      }
    },
    focusWindow: (windowId) => {
      const newState = focusWindow(get().windowManager, windowId);
      const win = newState.windows[windowId];
      set({
        windowManager: newState,
        activeApp: win?.appId || get().activeApp,
      });
    },
    minimizeWindow: (windowId) => {
      set({ windowManager: minimizeWindow(get().windowManager, windowId) });
    },
    maximizeWindow: (windowId) => {
      set({ windowManager: maximizeWindow(get().windowManager, windowId) });
    },
    moveWindowTo: (windowId, x, y) => {
      set({ windowManager: wmMoveWindow(get().windowManager, windowId, x, y) });
    },
    resizeWindowTo: (windowId, width, height) => {
      set({ windowManager: wmResizeWindow(get().windowManager, windowId, width, height) });
    },
    updateWindowTitle: (windowId, title) => {
      set({ windowManager: updateWindowTitle(get().windowManager, windowId, title) });
    },
    getWindowsForApp: (appId) => getWindowsForApp(get().windowManager, appId),

    // Desktop
    desktopIcons: buildDesktopIcons(initialFs),
    setDesktopIcons: (icons) => set({ desktopIcons: icons }),
    selectDesktopIcon: (nodeId) => {
      set({
        desktopIcons: get().desktopIcons.map((i) => ({
          ...i,
          selected: i.nodeId === nodeId,
        })),
      });
    },
    deselectAllIcons: () => {
      set({
        desktopIcons: get().desktopIcons.map((i) => ({ ...i, selected: false })),
      });
    },
    startEditingIcon: (nodeId) => {
      set({
        desktopIcons: get().desktopIcons.map((i) => ({
          ...i,
          editing: i.nodeId === nodeId,
          selected: i.nodeId === nodeId,
        })),
      });
    },
    stopEditingIcon: () => {
      set({
        desktopIcons: get().desktopIcons.map((i) => ({ ...i, editing: false })),
      });
    },
    moveDesktopIcon: (nodeId, x, y) => {
      set({
        desktopIcons: get().desktopIcons.map((i) =>
          i.nodeId === nodeId ? { ...i, x, y } : i
        ),
      });
    },
    refreshDesktopIcons: () => {
      const fs = get().fileSystem;
      const desktopNode = getNodeByPath(fs, '/Users/you/Desktop');
      if (!desktopNode) return;
      const existingIcons = get().desktopIcons;
      const existingMap = new Map(existingIcons.map((i) => [i.nodeId, i]));
      const GRID_Y = 90;
      let nextY = 40;
      const icons: DesktopIconState[] = desktopNode.children.map((id) => {
        if (existingMap.has(id)) return existingMap.get(id)!;
        const icon: DesktopIconState = { nodeId: id, x: 20, y: nextY, selected: false, editing: false };
        nextY += GRID_Y;
        return icon;
      });
      set({ desktopIcons: icons });
    },

    // Context menu
    contextMenu: null,
    showContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
    hideContextMenu: () => set({ contextMenu: null }),

    // Clipboard
    clipboard: null,
    setClipboard: (type, nodeIds) => set({ clipboard: { type, nodeIds } }),
    pasteClipboard: (targetFolderId) => {
      const clip = get().clipboard;
      if (!clip) return;
      for (const nodeId of clip.nodeIds) {
        if (clip.type === 'copy') {
          get().copyNode(nodeId, targetFolderId);
        } else {
          get().moveNode(nodeId, targetFolderId);
        }
      }
      if (clip.type === 'cut') {
        set({ clipboard: null });
      }
    },

    // Running apps
    runningApps: new Set(['finder']),
    launchApp: (appId) => {
      const existing = getWindowsForApp(get().windowManager, appId);
      if (existing.length > 0) {
        get().focusWindow(existing[0].id);
        return existing[0].id;
      }
      return get().openWindow(appId);
    },
    quitApp: (appId) => {
      const windows = getWindowsForApp(get().windowManager, appId);
      for (const w of windows) {
        get().closeWindow(w.id);
      }
    },

    // Active app
    activeApp: 'finder',

    // Keyboard
    pressedKeys: new Set<string>(),
    addPressedKey: (key) => {
      set({ pressedKeys: new Set([...get().pressedKeys, key]) });
    },
    removePressedKey: (key) => {
      const keys = new Set(get().pressedKeys);
      keys.delete(key);
      set({ pressedKeys: keys });
    },
    clearPressedKeys: () => set({ pressedKeys: new Set() }),
    handleShortcut: () => {
      const shortcut = matchShortcut(get().pressedKeys, defaultMacShortcuts, get().activeApp || undefined);
      return shortcut;
    },

    // Action recorder
    actionRecorder: createActionRecorderState(),
    recordAction: (action) => {
      set({ actionRecorder: recordAction(get().actionRecorder, action) });
    },

    // Lesson state
    lesson: {
      currentLessonId: null,
      currentStepIndex: 0,
      completedSteps: new Set(),
      hintVisible: false,
      lessonComplete: false,
    },
    setCurrentLesson: (lessonId) => {
      set({
        lesson: {
          currentLessonId: lessonId,
          currentStepIndex: 0,
          completedSteps: new Set(),
          hintVisible: false,
          lessonComplete: false,
        },
      });
    },
    advanceStep: () => {
      const lesson = get().lesson;
      set({
        lesson: {
          ...lesson,
          currentStepIndex: lesson.currentStepIndex + 1,
          hintVisible: false,
        },
      });
    },
    completeStep: (stepId) => {
      const lesson = get().lesson;
      const completed = new Set(lesson.completedSteps);
      completed.add(stepId);
      set({
        lesson: { ...lesson, completedSteps: completed },
      });
    },
    showHint: () => {
      set({ lesson: { ...get().lesson, hintVisible: true } });
    },
    hideHint: () => {
      set({ lesson: { ...get().lesson, hintVisible: false } });
    },
    setLessonComplete: (complete) => {
      set({ lesson: { ...get().lesson, lessonComplete: complete } });
    },
    resetLesson: () => {
      set({
        lesson: {
          currentLessonId: null,
          currentStepIndex: 0,
          completedSteps: new Set(),
          hintVisible: false,
          lessonComplete: false,
        },
      });
    },

    // Wallpaper
    wallpaper: 'default',
    setWallpaper: (wallpaper) => set({ wallpaper }),

    // Spotlight
    spotlightOpen: false,
    toggleSpotlight: () => set({ spotlightOpen: !get().spotlightOpen }),
    closeSpotlight: () => set({ spotlightOpen: false }),

    // Reset
    resetSimulation: () => {
      const fs = createDefaultMacFileSystem();
      set({
        fileSystem: fs,
        windowManager: createWindowManagerState(),
        desktopIcons: buildDesktopIcons(fs),
        contextMenu: null,
        clipboard: null,
        runningApps: new Set(['finder']),
        activeApp: 'finder',
        pressedKeys: new Set(),
        actionRecorder: createActionRecorderState(),
        spotlightOpen: false,
      });
    },
    loadState: (fileSystem) => {
      set({
        fileSystem,
        desktopIcons: buildDesktopIcons(fileSystem),
      });
    },
  };
});
