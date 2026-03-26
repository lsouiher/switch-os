import type { CompletionCheck, Lesson, LessonStep } from './types';
import type { SimulationStore } from '@/store/useSimulationStore';

export function checkCompletion(
  check: CompletionCheck,
  store: SimulationStore
): boolean {
  switch (check.type) {
    case 'file_exists': {
      const node = store.getNodeByPath(check.params.path as string);
      return node !== null;
    }
    case 'file_moved': {
      const destPath = check.params.destinationPath as string;
      const fileName = check.params.fileName as string;
      const destNode = store.getNodeByPath(destPath);
      if (!destNode) return false;
      const children = store.getChildren(destNode.id);
      return children.some((c) => c.name === fileName);
    }
    case 'file_renamed': {
      const node = store.getNodeByPath(check.params.path as string);
      return node !== null && node.name === (check.params.expectedName as string);
    }
    case 'folder_created': {
      const parentPath = check.params.parentPath as string;
      const parent = store.getNodeByPath(parentPath);
      if (!parent) return false;
      const children = store.getChildren(parent.id);
      // Check if any child is a folder that wasn't in the initial state
      return children.some((c) => c.type === 'folder');
    }
    case 'window_opened': {
      const appId = check.params.appId as string;
      const windows = store.getWindowsForApp(appId);
      if (check.params.path) {
        return windows.some((w) => w.meta?.path === check.params.path);
      }
      return windows.length > 0;
    }
    case 'window_closed': {
      const appId = check.params.appId as string;
      const windows = store.getWindowsForApp(appId);
      return windows.length === 0;
    }
    case 'app_launched': {
      const appId = check.params.appId as string;
      return store.runningApps.has(appId);
    }
    case 'shortcut_used': {
      const keys = check.params.keys as string[];
      const hasShortcut = store.actionRecorder.actions.some(
        (a) =>
          a.type === 'shortcut' &&
          a.data?.shortcut &&
          keys.every((k) => a.data!.shortcut!.includes(k))
      );
      if (hasShortcut && check.params.resultCheck) {
        return checkCompletion(check.params.resultCheck as CompletionCheck, store);
      }
      return hasShortcut;
    }
    case 'text_typed': {
      const text = check.params.text as string;
      return store.actionRecorder.actions.some(
        (a) => a.type === 'type' && a.data?.text?.includes(text)
      );
    }
    case 'setting_changed': {
      const setting = check.params.setting as string;
      const value = check.params.value as string;
      if (setting === 'wallpaper') {
        return store.wallpaper === value;
      }
      return false;
    }
    case 'search_performed': {
      return store.actionRecorder.actions.some(
        (a) => a.target?.elementType === 'spotlight-result'
      );
    }
    case 'item_in_trash': {
      const fileName = check.params.fileName as string;
      const trash = store.fileSystem.nodes[store.fileSystem.trashId];
      const trashChildren = store.getChildren(trash.id);
      return trashChildren.some((c) => c.name === fileName);
    }
    case 'right_click_on': {
      const target = check.params.target as string;
      return store.actionRecorder.actions.some(
        (a) => a.type === 'right-click' && a.target?.elementType === target
      );
    }
    case 'composite': {
      const operator = check.params.operator as 'and' | 'or';
      const checks = check.params.checks as CompletionCheck[];
      if (operator === 'and') {
        return checks.every((c) => checkCompletion(c, store));
      }
      return checks.some((c) => checkCompletion(c, store));
    }
    default:
      return false;
  }
}

export function isStepComplete(
  step: LessonStep,
  store: SimulationStore
): boolean {
  return checkCompletion(step.completionCheck, store);
}

export function isLessonComplete(
  lesson: Lesson,
  store: SimulationStore
): boolean {
  return checkCompletion(lesson.completionCriteria, store);
}

export function getCurrentStepIndex(
  lesson: Lesson,
  store: SimulationStore
): number {
  for (let i = 0; i < lesson.steps.length; i++) {
    if (!isStepComplete(lesson.steps[i], store)) {
      return i;
    }
  }
  return lesson.steps.length; // All complete
}

export function getProgress(
  lesson: Lesson,
  store: SimulationStore
): number {
  let completed = 0;
  for (const step of lesson.steps) {
    if (isStepComplete(step, store)) completed++;
  }
  return Math.round((completed / lesson.steps.length) * 100);
}
