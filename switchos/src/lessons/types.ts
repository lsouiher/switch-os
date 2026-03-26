export interface Lesson {
  id: string;
  trackId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  initialState: LessonInitialState;
  steps: LessonStep[];
  completionCriteria: CompletionCheck;
}

export interface LessonStep {
  id: string;
  order: number;
  instruction: string;
  hint: string;
  hintDelayMs: number;
  completionCheck: CompletionCheck;
  requiredActions?: string[];
}

export interface CompletionCheck {
  type:
    | 'file_exists'
    | 'file_moved'
    | 'file_renamed'
    | 'folder_created'
    | 'window_opened'
    | 'window_closed'
    | 'app_launched'
    | 'shortcut_used'
    | 'text_typed'
    | 'setting_changed'
    | 'search_performed'
    | 'item_in_trash'
    | 'right_click_on'
    | 'composite';
  params: Record<string, unknown>;
}

export interface LessonInitialState {
  fileSystem: string; // 'default-macos' or serialized
  openWindows: Array<{ appId: string; meta?: Record<string, unknown> }>;
  desktopIcons: Array<{ nodeId: string; x: number; y: number }>;
  dockApps: string[];
  activeApp: string | null;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  totalLessons: number;
}
