# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwitchOS is a browser-based platform for learning operating systems through interactive simulated desktops with guided lessons. The app lives in `switchos/`.

## Commands

All commands run from the `switchos/` directory:

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx prisma migrate dev    # Run database migrations
npx prisma generate       # Regenerate Prisma client after schema changes
```

## Architecture

### Simulation Engine (`src/simulation/`)

Four pure-functional subsystems that return new state immutably — they do not hold state themselves:

- **fileSystem.ts** — Tree of `FileSystemNode` objects linked by `parentId`. Initializes with a default macOS directory structure. Soft-delete moves nodes to trash; `permanentDeleteNode` for hard delete.
- **windowManager.ts** — Tracks open windows with position, size, z-index, focus, and a flexible `meta` object for app-specific data (e.g., Finder stores its current path in `meta.path`).
- **actionRecorder.ts** — Records all user interactions (clicks, shortcuts, typing, drags) for the lesson evaluator to query. This is how lessons verify the user performed the right actions.
- **keyboardHandler.ts** — Defines default macOS shortcuts and provides `matchShortcut()` for context-aware shortcut detection.

### State Management (`src/store/useSimulationStore.ts`)

A single Zustand store wraps all four simulation subsystems plus lesson state, desktop icons, clipboard, and running apps into one unified API (~30 action handlers). Components select individual fields via `useSimulationStore((s) => s.field)` for fine-grained reactivity.

### Lesson System (`src/lessons/`)

Lessons are **data-driven JSON files** in `src/lessons/content/<trackId>/`. No code changes needed to add lessons.

- **types.ts** — Defines `Lesson`, `LessonStep`, and `CompletionCheck` (with types like `file_exists`, `window_opened`, `shortcut_used`, `composite`, etc.)
- **loader.ts** — Statically imports all lesson JSON at build time. Provides `getLesson()`, `getTrackLessons()`, `getAllTracks()`.
- **evaluator.ts** — `checkCompletion(check, store)` evaluates whether a `CompletionCheck` is satisfied by inspecting the simulation store and action recorder. The `composite` type supports AND/OR logic.
- **hintEngine.ts** — `useHintTimer()` hook that auto-reveals hints after a configurable delay per step (default 15s), resetting on meaningful user actions.

### Lesson Flow

1. `LessonView` calls `resetSimulation()` → `setCurrentLesson()` → opens initial windows
2. `CoachPanel` polls `isStepComplete()` every 500ms
3. On step completion → records step → advances to next step or marks lesson complete
4. `useProgressSync` hook auto-saves progress to the server, including time spent and hints used

### Simulation UI (`src/components/simulation/`)

`Desktop.tsx` is the orchestrator — handles global keyboard events, shortcut dispatch, and renders all simulation components (MenuBar, Dock, Finder, TextEdit, Terminal, SystemSettings, Spotlight, ContextMenu, Window frames, DesktopIcons).

Each app component (Finder, TextEdit, etc.) reads from and writes to the Zustand store. `Window.tsx` provides the draggable/resizable frame that wraps app content.

### API Routes (`src/app/api/`)

- `/api/auth/[...nextauth]` — NextAuth with Credentials provider + JWT sessions
- `/api/register` — User registration with bcrypt
- `/api/progress` — GET/POST lesson progress (upsert, awards XP on completion)
- `/api/profile` — User profile data
- `/api/lessons/[lessonId]` — Lesson metadata

### Database

PostgreSQL with Prisma. Schema in `prisma/schema.prisma`. Key models: `User`, `LessonProgress`, `UserBadge`, `AgentSession`.

## Key Patterns

- **Immutable simulation state**: FS and window operations return new objects; the store replaces state (never mutates).
- **Action recorder as evaluator input**: Lesson checks query recorded actions, not just current state. This lets lessons verify *how* the user accomplished something (e.g., used a keyboard shortcut vs. menu).
- **Desktop icons are separate view state**: Derived from the file system but stored independently for x/y positioning.
- **Window meta object**: Extensible per-app state attached to windows (e.g., `meta.path` for Finder navigation).
- **Lesson initialization**: Always follows reset → set lesson → open initial windows sequence.

## Important: Next.js Version

This project uses **Next.js 16** which has breaking changes from earlier versions. Always read the relevant guide in `node_modules/next/dist/docs/` before writing code that touches Next.js APIs or conventions.
