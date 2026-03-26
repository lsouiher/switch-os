import { v4 as uuidv4 } from 'uuid';

export interface UserAction {
  id: string;
  timestamp: number;
  type: 'click' | 'double-click' | 'right-click' | 'drag' | 'keypress' | 'shortcut' | 'type';
  target: {
    elementId?: string;
    elementType?: string;
    coordinates?: { x: number; y: number };
  };
  data?: {
    key?: string;
    text?: string;
    shortcut?: string[];
    dragStart?: { x: number; y: number };
    dragEnd?: { x: number; y: number };
  };
}

export interface ActionRecorderState {
  actions: UserAction[];
  isRecording: boolean;
}

export function createActionRecorderState(): ActionRecorderState {
  return {
    actions: [],
    isRecording: true,
  };
}

export function recordAction(
  state: ActionRecorderState,
  action: Omit<UserAction, 'id' | 'timestamp'>
): ActionRecorderState {
  if (!state.isRecording) return state;
  const fullAction: UserAction = {
    ...action,
    id: uuidv4(),
    timestamp: Date.now(),
  };
  return {
    ...state,
    actions: [...state.actions, fullAction],
  };
}

export function getActionsSince(
  state: ActionRecorderState,
  timestamp: number
): UserAction[] {
  return state.actions.filter((a) => a.timestamp >= timestamp);
}

export function hasShortcutAction(
  state: ActionRecorderState,
  keys: string[],
  since?: number
): boolean {
  const actions = since ? getActionsSince(state, since) : state.actions;
  return actions.some(
    (a) =>
      a.type === 'shortcut' &&
      a.data?.shortcut &&
      keys.length === a.data.shortcut.length &&
      keys.every((k) => a.data!.shortcut!.includes(k))
  );
}

export function clearActions(state: ActionRecorderState): ActionRecorderState {
  return { ...state, actions: [] };
}
