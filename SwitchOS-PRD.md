# SwitchOS — Product Requirements Document v2.0

> **Learn Any Operating System, Without the Machine**

| Field | Value |
|---|---|
| Version | 2.0 (Consolidated) |
| Date | March 25, 2026 |
| Status | Draft |
| Classification | Confidential |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Target Users](#4-target-users)
5. [Use Cases](#5-use-cases)
6. [Product Requirements](#6-product-requirements)
7. [Functional Requirements (MVP)](#7-functional-requirements-mvp)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Models](#9-data-models)
10. [API Specification](#10-api-specification)
11. [UI/UX Specification](#11-uiux-specification)
12. [Business Model](#12-business-model)
13. [Go-to-Market Strategy](#13-go-to-market-strategy)
14. [Competitive Landscape](#14-competitive-landscape)
15. [Risks and Mitigations](#15-risks-and-mitigations)
16. [Success Criteria](#16-success-criteria)
17. [Appendix: Claude Code Implementation Guide](#17-appendix-claude-code-implementation-guide)

---

## 1. Executive Summary

SwitchOS is a browser-based SaaS platform that provides interactive, hands-on training environments for learning macOS, Windows, and Linux operating systems. Users log in from any device and are placed inside a realistic, simulated desktop environment with guided lessons that walk them through real-world tasks and workflows.

The product addresses three distinct markets:

1. **OS Switchers** — People transitioning between operating systems (e.g., Windows → macOS) who need hands-on practice before or after buying new hardware.
2. **First-Time Computer Users** — People learning to use a computer for the first time, including students, seniors, and users in developing economies.
3. **AI Agent Developers** — Teams building AI agents that need standardized, lightweight OS environments for training and benchmarking computer-use agents.

### Origin Story

This idea was born from a real pain point — a Windows user evaluating a Mac Mini for AI/ML development (specifically to host OpenClaw) who needed to learn macOS before committing to the purchase. No existing product solved this problem.

### Market Validation

- An Apple Support Community thread shows a user explicitly requesting a "macOS simulator website for people thinking of switching" and being told it does not exist.
- Reddit threads in r/mac regularly feature Windows users asking how to practice macOS before purchasing.
- OSWorld (the primary AI agent benchmark) requires heavyweight VM infrastructure; no lightweight, API-accessible alternative exists.
- The ITU estimates approximately 2.6 billion people remain offline globally, creating massive demand for structured computer literacy tools.

---

## 2. Problem Statement

### The Core Problem

People who need to learn a new operating system — or learn to use a computer at all — have no practical way to get hands-on experience without owning specific hardware.

**This creates downstream problems for:**

- **Professionals switching jobs** who face a new OS with zero onboarding support
- **IT support staff** who need to troubleshoot OS platforms they can't practice on outside work
- **Consumers considering a platform switch** who cannot try before they buy
- **Developers evaluating OS-specific tools** (macOS for AI/ML, Linux for servers) who can't build confidence without hardware
- **Enterprise IT departments** spending significant resources onboarding employees onto new platforms
- **First-time computer users** with no structured, interactive starting point
- **AI agent developers** with no lightweight, standardized OS environments for training

### Why Existing Solutions Fail

| Solution Category | What It Does | Why It Falls Short |
|---|---|---|
| Video courses (Udemy, LinkedIn Learning) | Passive walkthroughs with screen recordings | No hands-on practice. Low retention. No interaction. |
| Browser UI clones (macos-web.app) | Visual replicas of OS interfaces | No educational structure. No guided tasks. Just a demo. |
| Cloud VMs (BrowserStack, AWS) | Remote access to real OS instances | Built for dev testing, not learning. Expensive, complex, no curriculum. |
| Local VMs (Parallels, VirtualBox) | Run OS in virtual machine locally | Requires technical setup. macOS restricted to Apple hardware. No training layer. |
| OSWorld benchmark | VM-based OS environment for AI agent eval | Heavyweight, expensive, complex setup. Not accessible for lightweight training. |

---

## 3. Product Vision

**SwitchOS is the Duolingo for operating systems** — a structured, gamified, hands-on learning platform where users practice real OS skills in a safe, simulated environment accessible from any browser. It also serves as standardized infrastructure for AI agent training.

### Vision Pillars

1. **Hands-on first** — Every lesson involves doing, not watching
2. **Multi-OS** — One platform for macOS, Windows, and Linux
3. **Zero hardware required** — Everything runs in the browser
4. **Structured curriculum** — Organized by skill level and use case with progress tracking
5. **Contextual for switchers** — Specific paths mapping familiar concepts to new equivalents
6. **Universal accessibility** — Serves users from absolute beginners to AI agents
7. **Platform flywheel** — Human learning data improves agent training; agent research improves human learning

---

## 4. Target Users

### Primary Personas

| Persona | Description | Pain Point | Desired Outcome |
|---|---|---|---|
| **The Switcher** | Consumer/professional changing platforms (e.g., Windows → macOS) | Cannot try new OS before buying; intimidated by unfamiliar UX | Confidence to switch; productive on Day 1 |
| **The New Hire** | Employee joining company using different OS | Slow ramp-up; embarrassment asking basic OS questions | Self-serve onboarding before/during first week |
| **The IT Professional** | IT support/sysadmin troubleshooting multiple OS platforms | Cannot practice outside work; limited hardware access | On-demand practice across all platforms |
| **The Developer** | Dev evaluating OS-specific tooling (Xcode, Linux servers) | Needs to understand OS environment before committing | Familiarity with dev workflows on target OS |
| **The First-Timer** | Person using a computer for first time (student, senior, new worker) | Everything is unfamiliar; no structured starting point | Confidence to perform basic tasks independently |
| **The Educator** | Teacher/NGO trainer onboarding groups of new users | No standardized curriculum; can't give 1:1 attention | Turnkey platform to assign, track, support at scale |
| **The Agent Developer** | AI team building computer-use agents | Heavyweight VMs are expensive/complex; no standard training env | Lightweight, API-accessible, multi-OS sandbox |

### Secondary Personas

- Students and educators in computer science / IT certification programs
- Seniors and non-technical users learning a gifted computer
- Enterprise L&D teams building standardized OS onboarding
- AI researchers publishing benchmark results on computer-use agents

---

## 5. Use Cases

### Use Case 1: OS Switching (Original)

A Windows user considering a Mac Mini for AI development logs into SwitchOS, selects the "Windows → macOS" switcher track, and is placed in a simulated macOS desktop. Guided lessons teach Finder vs File Explorer, Cmd vs Ctrl shortcuts, Spotlight, trackpad gestures, and app installation. After completing the track, the user has enough confidence to purchase hardware.

### Use Case 2: First-Time Computer User (New)

A student in a digital literacy program opens SwitchOS on a shared computer. The "Level Zero" curriculum teaches mouse basics (click, drag, double-click), keyboard layout, the concept of files and folders, opening/closing windows, and basic web browsing. An instructor monitors 25 students from a dashboard, seeing who is stuck and providing help.

### Use Case 3: AI Agent Training (New)

An AI startup building a computer-use agent hits SwitchOS's Agent Sandbox API. They launch 100 parallel macOS simulation instances, each presenting a task ("Create a folder named Projects on the Desktop"). Their agent sends click/type actions via API and receives screenshots back. Automated evaluation scripts verify task completion and feed reward signals into the agent's RL training loop.

---

## 6. Product Requirements

### 6.1 Simulated Desktop Environments

#### macOS Environment
- Desktop with Dock, Menu Bar, and Notification Center
- Functional Finder with sidebar, file/folder operations, Quick Look
- System Settings panels with interactive controls
- Spotlight Search (Cmd+Space activation)
- Mission Control and multi-desktop switching
- Trackpad gesture visualization (simulated with mouse/keyboard)

#### Windows Environment
- Desktop with Taskbar, Start Menu, and System Tray
- File Explorer with ribbon interface, navigation, file operations
- Settings app and legacy Control Panel
- Snap Layouts and virtual desktops
- Task Manager simulation
- PowerShell and Command Prompt terminals

#### Linux Environment
- GNOME-style desktop with Activities overview
- Nautilus file manager simulation
- Fully functional terminal emulator (ls, cd, cp, mv, chmod, apt, etc.)
- Package manager simulation (apt/dnf)
- Text editor basics (nano/vim)
- File permission system with visual feedback

### 6.2 Guided Learning System

- Each lesson has a clear objective ("Create a folder on the Desktop and move a file into it")
- Step-by-step instructions in a sidebar coach panel
- System detects correct step completion before advancing
- Contextual hints after 15 seconds of inactivity
- "Show me" button provides animated walkthrough
- Completion verification via execution-based checks

### 6.3 Curriculum Tracks

| Track | Level | Lessons | Example Topics |
|---|---|---|---|
| Level Zero: Computer Basics | Absolute Beginner | 12 | Mouse, keyboard, desktop, windows, files, internet |
| macOS Foundations | Beginner | 20 | Finder, Dock, Spotlight, System Settings, gestures |
| Windows Foundations | Beginner | 20 | Start Menu, File Explorer, Taskbar, Settings, Snap |
| Linux Foundations | Beginner | 20 | Terminal, file system, permissions, package management |
| Windows → macOS | Switcher | 15 | Shortcut mapping, Finder vs Explorer, app differences |
| macOS → Windows | Switcher | 15 | Start Menu vs Dock, Control Panel, file paths |
| Any → Linux | Switcher | 15 | CLI essentials, GUI navigation, software installation |
| macOS for Developers | Advanced | 12 | Terminal, Homebrew, Xcode CLI, env vars, SSH |
| Linux for Servers | Advanced | 12 | SSH, systemd, cron, networking, logs, users |
| Windows for Enterprise | Advanced | 12 | AD basics, Group Policy, PowerShell scripting |

### 6.4 Keyboard Shortcut Trainer
- Interactive drills with timed challenges
- Side-by-side comparison mode ("On Windows: Ctrl+C → On macOS: Cmd+C. Try it now.")
- Printable cheat sheets
- Spaced repetition for frequently forgotten shortcuts

### 6.5 Progress and Gamification
- User profiles with progress across all tracks
- Completion badges and certificates
- XP system with daily streaks
- Optional leaderboards
- Pre/post skill assessments

### 6.6 AI-Powered Assistant
- Context-aware: knows current lesson and screen state
- Natural language: "How do I force quit on Mac?"
- Cross-OS translation: "On Windows I did X — how do I do that here?"

### 6.7 Agent Sandbox API
- Programmatic API to launch simulation environments
- Send actions (click, type, drag) → receive screenshots/DOM/a11y tree
- Reset environment to known state
- Parallel instance scaling (10, 100, 1000+)
- Pre-built task libraries with execution-based evaluation
- Trajectory logging for training data collection

### 6.8 Level Zero: First-Time Users
- Module 1: The Mouse — hold, left-click, right-click, double-click, drag
- Module 2: The Keyboard — layout, typing, Shift, Enter, Backspace
- Module 3: The Desktop — icons, wallpaper, open/close apps
- Module 4: Windows and Menus — open, close, minimize, maximize, resize
- Module 5: Files and Folders — create, name, move, copy, delete
- Module 6: The Internet — browser, URLs, search, links, back
- Adaptive difficulty (skip ahead if proficient, slow down if struggling)
- Multilingual (10 languages at launch)
- Audio narration for low-literacy users
- Classroom/cohort mode with instructor dashboard

---

## 7. Functional Requirements (MVP)

> **This section is the implementation specification for Claude Code.**
> MVP scope: macOS simulation with 10 guided lessons from the "macOS Foundations" track.

### 7.1 Application Architecture

```
switchos/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing/marketing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx      # Authenticated layout with sidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── tracks/page.tsx
│   │   │   ├── tracks/[trackId]/page.tsx
│   │   │   ├── lesson/[lessonId]/page.tsx  # Main simulation view
│   │   │   └── profile/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── progress/route.ts
│   │       ├── lessons/[lessonId]/route.ts
│   │       └── agent/
│   │           ├── sessions/route.ts
│   │           ├── actions/route.ts
│   │           └── evaluate/route.ts
│   ├── components/
│   │   ├── simulation/
│   │   │   ├── Desktop.tsx           # Main simulation container
│   │   │   ├── Dock.tsx              # macOS dock
│   │   │   ├── MenuBar.tsx           # Top menu bar
│   │   │   ├── Window.tsx            # Draggable, resizable window
│   │   │   ├── Finder.tsx            # File manager simulation
│   │   │   ├── SystemSettings.tsx    # Settings panels
│   │   │   ├── Spotlight.tsx         # Search overlay
│   │   │   ├── Terminal.tsx          # Terminal emulator
│   │   │   ├── TextEdit.tsx          # Basic text editor
│   │   │   ├── TrashCan.tsx          # Trash functionality
│   │   │   ├── ContextMenu.tsx       # Right-click menus
│   │   │   ├── NotificationCenter.tsx
│   │   │   └── DesktopIcon.tsx       # Files/folders on desktop
│   │   ├── learning/
│   │   │   ├── CoachPanel.tsx        # Sidebar lesson instructions
│   │   │   ├── StepIndicator.tsx     # Progress through lesson steps
│   │   │   ├── HintBubble.tsx        # Contextual hints
│   │   │   ├── ShowMeOverlay.tsx     # Animated walkthrough
│   │   │   └── CompletionModal.tsx   # Lesson complete celebration
│   │   ├── dashboard/
│   │   │   ├── TrackCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── StreakCounter.tsx
│   │   │   └── BadgeGrid.tsx
│   │   └── ui/                       # Shared UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Tooltip.tsx
│   ├── simulation/
│   │   ├── engine.ts                 # Core simulation state machine
│   │   ├── fileSystem.ts             # Virtual file system (in-memory)
│   │   ├── windowManager.ts          # Window positioning, z-index, focus
│   │   ├── keyboardHandler.ts        # Shortcut interception and mapping
│   │   ├── actionRecorder.ts         # Records user actions for evaluation
│   │   └── apps/                     # App-specific logic
│   │       ├── finder.ts
│   │       ├── terminal.ts
│   │       ├── textEdit.ts
│   │       ├── settings.ts
│   │       └── spotlight.ts
│   ├── lessons/
│   │   ├── types.ts                  # Lesson, Step, Task type definitions
│   │   ├── loader.ts                 # Load lesson content from JSON
│   │   ├── evaluator.ts             # Check if step/task is completed
│   │   ├── hintEngine.ts            # Timed hint delivery
│   │   └── content/                  # Lesson definitions (JSON)
│   │       ├── macos-foundations/
│   │       │   ├── 01-desktop-basics.json
│   │       │   ├── 02-dock-and-apps.json
│   │       │   ├── 03-finder-navigation.json
│   │       │   ├── 04-creating-files-folders.json
│   │       │   ├── 05-moving-and-copying.json
│   │       │   ├── 06-spotlight-search.json
│   │       │   ├── 07-system-settings.json
│   │       │   ├── 08-keyboard-shortcuts.json
│   │       │   ├── 09-multiple-windows.json
│   │       │   └── 10-trash-and-cleanup.json
│   │       └── _template.json
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── db.ts                     # Prisma client
│   │   └── analytics.ts             # Event tracking
│   └── styles/
│       └── globals.css
└── public/
    ├── icons/                        # macOS-style app icons
    ├── wallpapers/                   # Desktop backgrounds
    └── sounds/                       # UI sounds (optional)
```

### 7.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Full-stack React with SSR, API routes, great DX |
| Language | TypeScript | Type safety across simulation engine and UI |
| Styling | Tailwind CSS | Rapid UI development; easy to replicate OS aesthetics |
| State Management | Zustand | Lightweight, perfect for simulation state (windows, files, focus) |
| Database | PostgreSQL via Prisma | Relational data for users, progress, lessons |
| Auth | NextAuth.js | OAuth + email/password with minimal setup |
| Deployment | Vercel | Zero-config Next.js hosting, edge functions |
| Real-time | (future) WebSocket via Socket.io | For AI assistant and collaborative features |

### 7.3 Core Simulation Engine

#### 7.3.1 Virtual File System

```typescript
// src/simulation/fileSystem.ts

interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'app';
  parentId: string | null;
  children?: string[];          // IDs of children (folders only)
  content?: string;             // Text content (files only)
  icon: string;                 // Icon identifier
  size: number;                 // Bytes (simulated)
  createdAt: Date;
  modifiedAt: Date;
  metadata?: {
    fileExtension?: string;
    mimeType?: string;
    isHidden?: boolean;
    isSystem?: boolean;
  };
}

interface FileSystem {
  nodes: Map<string, FileSystemNode>;
  root: string;                 // Root node ID

  // Operations
  createFile(parentId: string, name: string, content?: string): FileSystemNode;
  createFolder(parentId: string, name: string): FileSystemNode;
  rename(nodeId: string, newName: string): void;
  move(nodeId: string, newParentId: string): void;
  copy(nodeId: string, newParentId: string): FileSystemNode;
  delete(nodeId: string): void;              // Move to trash
  permanentDelete(nodeId: string): void;     // Remove from trash
  getChildren(nodeId: string): FileSystemNode[];
  getPath(nodeId: string): string;           // e.g., "/Users/you/Desktop/Projects"
  findByName(name: string): FileSystemNode[];
  findByPath(path: string): FileSystemNode | null;

  // Serialization
  serialize(): string;          // For save states
  deserialize(data: string): void;
}
```

**Default file system structure (macOS simulation):**

```
/
├── Users/
│   └── you/
│       ├── Desktop/
│       │   ├── Welcome.txt
│       │   └── SampleImage.png
│       ├── Documents/
│       │   ├── Notes.txt
│       │   └── Report.docx
│       ├── Downloads/
│       │   └── installer.dmg
│       ├── Pictures/
│       │   └── vacation.jpg
│       ├── Music/
│       └── Movies/
├── Applications/
│   ├── Finder.app
│   ├── TextEdit.app
│   ├── Terminal.app
│   ├── System Settings.app
│   ├── Safari.app (placeholder)
│   └── Calculator.app (placeholder)
└── Trash/
```

#### 7.3.2 Window Manager

```typescript
// src/simulation/windowManager.ts

interface WindowState {
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
}

interface WindowManager {
  windows: Map<string, WindowState>;
  focusedWindowId: string | null;
  nextZIndex: number;

  // Operations
  openWindow(appId: string, props?: Partial<WindowState>): string;
  closeWindow(windowId: string): void;
  focusWindow(windowId: string): void;
  minimizeWindow(windowId: string): void;
  maximizeWindow(windowId: string): void;
  restoreWindow(windowId: string): void;
  moveWindow(windowId: string, x: number, y: number): void;
  resizeWindow(windowId: string, width: number, height: number): void;
  getWindowsForApp(appId: string): WindowState[];
  getTopWindow(): WindowState | null;
}
```

#### 7.3.3 Keyboard Handler

```typescript
// src/simulation/keyboardHandler.ts

interface ShortcutDefinition {
  keys: string[];               // e.g., ["Meta", "c"] for Cmd+C
  action: string;               // e.g., "copy"
  context?: string;             // e.g., "finder" (app-specific)
  description: string;          // Human-readable
}

interface KeyboardHandler {
  shortcuts: ShortcutDefinition[];
  pressedKeys: Set<string>;

  registerShortcut(shortcut: ShortcutDefinition): void;
  handleKeyDown(event: KeyboardEvent): { action: string; prevented: boolean } | null;
  handleKeyUp(event: KeyboardEvent): void;

  // macOS shortcuts (MVP)
  defaultMacShortcuts: ShortcutDefinition[];
  // e.g., Cmd+C (copy), Cmd+V (paste), Cmd+X (cut), Cmd+Z (undo),
  //        Cmd+A (select all), Cmd+N (new), Cmd+W (close window),
  //        Cmd+Q (quit app), Cmd+Space (spotlight), Cmd+Tab (app switch),
  //        Cmd+Delete (move to trash), Cmd+Shift+N (new folder)
}
```

#### 7.3.4 Action Recorder

```typescript
// src/simulation/actionRecorder.ts

interface UserAction {
  id: string;
  timestamp: number;
  type: 'click' | 'double-click' | 'right-click' | 'drag' | 'keypress' | 'shortcut' | 'type';
  target: {
    elementId?: string;
    elementType?: string;       // e.g., "dock-icon", "desktop-icon", "window-title"
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

interface ActionRecorder {
  actions: UserAction[];
  isRecording: boolean;

  startRecording(): void;
  stopRecording(): UserAction[];
  recordAction(action: Omit<UserAction, 'id' | 'timestamp'>): void;
  getActionsSince(timestamp: number): UserAction[];
  clear(): void;

  // For AI agent API
  toTrajectory(): AgentTrajectory;
}
```

### 7.4 Lesson System

#### 7.4.1 Lesson Content Schema

```typescript
// src/lessons/types.ts

interface Lesson {
  id: string;
  trackId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];      // Lesson IDs
  initialState: SimulationState; // File system + open windows + desktop state
  steps: LessonStep[];
  completionCriteria: CompletionCheck;
}

interface LessonStep {
  id: string;
  order: number;
  instruction: string;          // Shown in coach panel
  hint: string;                 // Shown after delay
  showMeAnimation?: Animation;  // Optional animated walkthrough
  completionCheck: CompletionCheck;
  hintDelayMs: number;          // Default 15000 (15 seconds)
  requiredActions?: string[];   // Optional: specific action types expected
}

interface CompletionCheck {
  type: 'file_exists' | 'file_moved' | 'file_renamed' | 'folder_created' |
        'window_opened' | 'window_closed' | 'app_launched' | 'shortcut_used' |
        'text_typed' | 'setting_changed' | 'search_performed' | 'item_in_trash' |
        'composite';
  params: Record<string, any>;
  // For composite: { operator: 'and' | 'or', checks: CompletionCheck[] }
}

interface SimulationState {
  fileSystem: SerializedFileSystem;
  openWindows: WindowState[];
  desktopIcons: DesktopIconState[];
  dockApps: DockAppState[];
  activeApp: string | null;
}

interface Animation {
  steps: AnimationStep[];
}

interface AnimationStep {
  type: 'move_cursor' | 'click' | 'type' | 'highlight' | 'wait';
  target?: { x: number; y: number } | string; // Coordinates or element ID
  duration: number;
  data?: any;
}
```

#### 7.4.2 Example Lesson Definition

```json
// src/lessons/content/macos-foundations/04-creating-files-folders.json
{
  "id": "macos-foundations-04",
  "trackId": "macos-foundations",
  "order": 4,
  "title": "Creating Files and Folders",
  "description": "Learn how to create new folders and files on your Mac desktop and in Finder.",
  "estimatedMinutes": 8,
  "difficulty": "beginner",
  "prerequisites": ["macos-foundations-03"],
  "initialState": {
    "fileSystem": "default-macos",
    "openWindows": [],
    "desktopIcons": [
      { "nodeId": "welcome-txt", "x": 50, "y": 50 },
      { "nodeId": "sample-img", "x": 50, "y": 130 }
    ],
    "dockApps": ["finder", "textedit", "terminal", "settings", "trash"],
    "activeApp": null
  },
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "instruction": "Right-click on an empty area of the Desktop to open the context menu.",
      "hint": "Move your mouse to an empty spot on the desktop background (not on an icon) and right-click. On a Mac trackpad, you can also two-finger click.",
      "hintDelayMs": 15000,
      "completionCheck": {
        "type": "composite",
        "params": {
          "operator": "and",
          "checks": [
            { "type": "right_click_on", "params": { "target": "desktop" } }
          ]
        }
      }
    },
    {
      "id": "step-2",
      "order": 2,
      "instruction": "Select 'New Folder' from the context menu.",
      "hint": "Look for 'New Folder' in the menu that appeared. Click on it.",
      "hintDelayMs": 10000,
      "completionCheck": {
        "type": "folder_created",
        "params": { "parentPath": "/Users/you/Desktop" }
      }
    },
    {
      "id": "step-3",
      "order": 3,
      "instruction": "Name the folder 'My Project' and press Return to confirm.",
      "hint": "The folder name should be highlighted and editable. Type 'My Project' and press the Return (Enter) key.",
      "hintDelayMs": 12000,
      "completionCheck": {
        "type": "file_renamed",
        "params": {
          "path": "/Users/you/Desktop/My Project",
          "expectedName": "My Project"
        }
      }
    },
    {
      "id": "step-4",
      "order": 4,
      "instruction": "Now drag the 'Welcome.txt' file into your new 'My Project' folder.",
      "hint": "Click and hold on 'Welcome.txt', then drag it over the 'My Project' folder and release.",
      "hintDelayMs": 15000,
      "completionCheck": {
        "type": "file_moved",
        "params": {
          "fileName": "Welcome.txt",
          "destinationPath": "/Users/you/Desktop/My Project"
        }
      }
    },
    {
      "id": "step-5",
      "order": 5,
      "instruction": "Double-click the 'My Project' folder to open it in Finder.",
      "hint": "Double-click means two quick clicks on the folder icon.",
      "hintDelayMs": 10000,
      "completionCheck": {
        "type": "window_opened",
        "params": { "appId": "finder", "path": "/Users/you/Desktop/My Project" }
      }
    },
    {
      "id": "step-6",
      "order": 6,
      "instruction": "Use the keyboard shortcut Cmd+Shift+N to create another new folder inside 'My Project'.",
      "hint": "Hold down the Command (⌘) key and Shift key together, then press N. This is a faster way to create folders!",
      "hintDelayMs": 15000,
      "completionCheck": {
        "type": "shortcut_used",
        "params": {
          "keys": ["Meta", "Shift", "n"],
          "resultCheck": {
            "type": "folder_created",
            "params": { "parentPath": "/Users/you/Desktop/My Project" }
          }
        }
      }
    },
    {
      "id": "step-7",
      "order": 7,
      "instruction": "Name this folder 'Notes' and press Return.",
      "hint": "Type 'Notes' and press Return to confirm the name.",
      "hintDelayMs": 10000,
      "completionCheck": {
        "type": "file_renamed",
        "params": {
          "path": "/Users/you/Desktop/My Project/Notes",
          "expectedName": "Notes"
        }
      }
    }
  ],
  "completionCriteria": {
    "type": "composite",
    "params": {
      "operator": "and",
      "checks": [
        { "type": "file_exists", "params": { "path": "/Users/you/Desktop/My Project" } },
        { "type": "file_exists", "params": { "path": "/Users/you/Desktop/My Project/Welcome.txt" } },
        { "type": "file_exists", "params": { "path": "/Users/you/Desktop/My Project/Notes" } }
      ]
    }
  }
}
```

#### 7.4.3 Lesson Evaluator

```typescript
// src/lessons/evaluator.ts

interface LessonEvaluator {
  // Check a single completion condition against current simulation state
  checkCompletion(check: CompletionCheck, state: SimulationState): boolean;

  // Check if current step is complete
  isStepComplete(step: LessonStep, state: SimulationState, actions: UserAction[]): boolean;

  // Check if entire lesson is complete
  isLessonComplete(lesson: Lesson, state: SimulationState): boolean;

  // Get current step (first incomplete step)
  getCurrentStep(lesson: Lesson, state: SimulationState, actions: UserAction[]): LessonStep | null;

  // Get progress percentage
  getProgress(lesson: Lesson, state: SimulationState, actions: UserAction[]): number;
}

// Implementation of check types:
// - file_exists: fileSystem.findByPath(params.path) !== null
// - file_moved: file with params.fileName exists at params.destinationPath
// - file_renamed: node at path has name === params.expectedName
// - folder_created: folder exists at params.parentPath (any new folder)
// - window_opened: windowManager has window for params.appId
// - app_launched: appId is in running apps
// - shortcut_used: actionRecorder has shortcut action matching params.keys
// - text_typed: actionRecorder has type action with params.text
// - item_in_trash: file system has node in /Trash/ matching params.fileName
// - composite: AND/OR of sub-checks
```

### 7.5 User Progress System

```typescript
// src/lib/progress.ts

interface UserProgress {
  userId: string;
  lessonId: string;
  trackId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStepId: string | null;
  completedSteps: string[];
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpentSeconds: number;
  attempts: number;
  hintsUsed: number;
  showMeUsed: number;
  savedState: string | null;    // Serialized simulation state
}

interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  tier: 'free' | 'switcher' | 'enterprise';
  xp: number;
  streak: number;               // Consecutive days with lesson activity
  lastActiveAt: Date;
  badges: Badge[];
  completedTracks: string[];
  completedLessons: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}
```

### 7.6 MVP Lesson List (macOS Foundations Track)

| # | Lesson Title | Key Skills | Steps | Completion Criteria |
|---|---|---|---|---|
| 01 | Desktop Basics | Identify desktop elements, wallpaper, menu bar | 5 | Click menu bar items, identify Dock |
| 02 | The Dock and Launching Apps | Open/close apps from Dock, Dock preferences | 6 | Launch Finder and TextEdit from Dock |
| 03 | Navigating with Finder | Sidebar, column/icon/list views, breadcrumb | 7 | Navigate to Documents, switch views |
| 04 | Creating Files and Folders | New folder, rename, drag to move | 7 | Create folder, move file, use Cmd+Shift+N |
| 05 | Moving and Copying Files | Drag, Cmd+C/V, duplicate | 6 | Copy file between folders |
| 06 | Spotlight Search | Cmd+Space, search for files/apps | 5 | Find and open a file via Spotlight |
| 07 | System Settings | Open Settings, change wallpaper, check About | 6 | Change desktop wallpaper |
| 08 | Keyboard Shortcuts | Cmd+C/V/Z/A/W/Q, Cmd+Tab | 8 | Perform 5 shortcuts correctly |
| 09 | Working with Multiple Windows | Resize, arrange, minimize, Cmd+Tab switch | 6 | Arrange 3 windows, switch between them |
| 10 | Trash and Cleanup | Delete files, empty trash, Cmd+Delete | 5 | Move files to Trash, empty Trash |

---

## 8. Technical Architecture

### 8.1 High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                   BROWSER CLIENT                  │
│                                                    │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Simulation  │  │  Coach   │  │  Dashboard   │ │
│  │   Engine     │  │  Panel   │  │  & Progress  │ │
│  │  (Zustand)   │  │          │  │              │ │
│  └──────┬───────┘  └────┬─────┘  └──────┬───────┘ │
│         │               │               │         │
│  ┌──────┴───────────────┴───────────────┴───────┐ │
│  │            State Management (Zustand)          │ │
│  │  fileSystem | windowManager | lessonState      │ │
│  └──────────────────────┬────────────────────────┘ │
└─────────────────────────┼──────────────────────────┘
                          │ HTTPS / REST
┌─────────────────────────┼──────────────────────────┐
│                    NEXT.JS SERVER                    │
│                                                      │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐ │
│  │  Auth Routes  │  │  Progress │  │  Agent API   │ │
│  │  (NextAuth)   │  │  Routes   │  │  Routes      │ │
│  └──────┬────────┘  └─────┬─────┘  └──────┬───────┘ │
│         │                 │               │          │
│  ┌──────┴─────────────────┴───────────────┴────────┐│
│  │                  Prisma ORM                      ││
│  └──────────────────────┬──────────────────────────┘│
└─────────────────────────┼───────────────────────────┘
                          │
                 ┌────────┴────────┐
                 │   PostgreSQL    │
                 │                 │
                 │  users          │
                 │  progress       │
                 │  sessions       │
                 │  agent_sessions │
                 └─────────────────┘
```

### 8.2 Key Design Decisions

1. **Client-side simulation** — The OS simulation runs entirely in the browser. No server-side VMs. This keeps costs near zero and latency at zero.
2. **Zustand for state** — The simulation has complex, interconnected state (files, windows, focus, clipboard). Zustand handles this cleanly without Redux boilerplate.
3. **JSON-defined lessons** — Lesson content is data, not code. This enables non-engineers to author new lessons and allows future CMS integration.
4. **Execution-based evaluation** — Lesson steps are verified by checking simulation state, not by matching exact action sequences. This allows users to complete tasks in their own way.
5. **Progressive enhancement** — MVP starts with macOS only. Windows and Linux share the same engine architecture with different theme/behavior configs.

---

## 9. Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  tier          Tier      @default(FREE)
  xp            Int       @default(0)
  streak        Int       @default(0)
  lastActiveAt  DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  progress      LessonProgress[]
  badges        UserBadge[]
  agentSessions AgentSession[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LessonProgress {
  id              String   @id @default(cuid())
  userId          String
  lessonId        String
  trackId         String
  status          LessonStatus @default(NOT_STARTED)
  currentStepId   String?
  completedSteps  String[]     @default([])
  startedAt       DateTime?
  completedAt     DateTime?
  timeSpentSecs   Int          @default(0)
  attempts        Int          @default(0)
  hintsUsed       Int          @default(0)
  showMeUsed      Int          @default(0)
  savedState      Json?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId, trackId])
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badgeId  String
  earnedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
}

model AgentSession {
  id          String   @id @default(cuid())
  userId      String
  osType      OSType
  status      SessionStatus @default(ACTIVE)
  taskId      String?
  actions     Json[]       @default([])
  screenshots Int          @default(0)
  startedAt   DateTime     @default(now())
  endedAt     DateTime?
  result      Json?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}

enum Tier {
  FREE
  SWITCHER
  ENTERPRISE
}

enum LessonStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum OSType {
  MACOS
  WINDOWS
  LINUX
}

enum SessionStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  FAILED
}
```

---

## 10. API Specification

### 10.1 Human Learning API

```
POST   /api/auth/register          # Create account
POST   /api/auth/[...nextauth]     # NextAuth handlers
GET    /api/progress               # Get all progress for current user
GET    /api/progress/:trackId      # Get progress for specific track
POST   /api/progress/:lessonId     # Update progress (step completed, hint used, etc.)
PUT    /api/progress/:lessonId     # Save state (simulation snapshot)
GET    /api/lessons/:lessonId      # Get lesson definition
GET    /api/tracks                 # List all tracks
GET    /api/tracks/:trackId        # Get track with lessons
GET    /api/profile                # Get user profile
PUT    /api/profile                # Update profile
```

### 10.2 Agent Sandbox API

```
POST   /api/agent/sessions                 # Create new simulation session
  Body: { osType: "macos" | "windows" | "linux", taskId?: string }
  Returns: { sessionId, initialScreenshot (base64), a11yTree }

POST   /api/agent/sessions/:id/actions     # Send action to simulation
  Body: {
    type: "click" | "double_click" | "right_click" | "type" | "keypress" | "drag" | "scroll",
    params: {
      x?: number, y?: number,               // For click/drag
      text?: string,                         // For type
      key?: string, modifiers?: string[],    // For keypress
      startX?: number, startY?: number,      // For drag
      endX?: number, endY?: number,
      deltaY?: number                        // For scroll
    }
  }
  Returns: { screenshot (base64), a11yTree, reward?: number, done?: boolean }

GET    /api/agent/sessions/:id/state       # Get current simulation state
  Returns: { screenshot, a11yTree, fileSystemState, openWindows }

POST   /api/agent/sessions/:id/reset       # Reset to initial state
  Returns: { screenshot, a11yTree }

POST   /api/agent/sessions/:id/evaluate    # Run task evaluation
  Returns: { success: boolean, score: number, details: {} }

DELETE /api/agent/sessions/:id             # End session

GET    /api/agent/tasks                    # List available tasks
GET    /api/agent/tasks/:taskId            # Get task definition
```

---

## 11. UI/UX Specification

### 11.1 Simulation View Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ☰ SwitchOS    Lesson 4: Creating Files and Folders    ⓧ    │  ← App header (thin)
├────────────────────────────────────┬─────────────────────────┤
│                                    │                         │
│                                    │   COACH PANEL           │
│                                    │                         │
│   SIMULATED macOS DESKTOP          │   Step 3 of 7           │
│                                    │   ━━━━━━●━━━━━━━━━━━━   │
│   [Desktop with Dock, icons,       │                         │
│    windows, menu bar — all         │   📝 Name the folder    │
│    interactive]                    │   'My Project' and      │
│                                    │   press Return.         │
│                                    │                         │
│                                    │   💡 Hint: The folder   │
│                                    │   name should be        │
│                                    │   highlighted...        │
│                                    │                         │
│                                    │   [Show Me]  [Skip]     │
│                                    │                         │
│                                    │   ─────────────────     │
│                                    │   Progress: 42%         │
│  ▊ Finder  TextEdit  Terminal  🗑  │   XP: +15 this lesson   │
├────────────────────────────────────┴─────────────────────────┤
│  Keyboard: ⌘+Shift+N = New Folder  |  ⌘+Delete = Trash      │  ← Shortcut bar
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Key UI States

| State | Behavior |
|---|---|
| Step pending | Instruction visible, hint hidden, coach panel highlights next action area |
| Hint triggered | After delay, hint text fades in with subtle animation |
| Step completed | Checkmark animation, instruction updates to next step, XP +5 |
| Show Me requested | Overlay dims desktop, animated cursor demonstrates the action |
| Lesson completed | Celebration modal with stats, XP earned, badge (if applicable), "Next Lesson" CTA |
| Stuck detection | If no actions for 30s, coach panel gently prompts "Need help? Try the hint or Show Me button" |

### 11.3 Design Language

| Element | macOS Sim | Windows Sim | Linux Sim |
|---|---|---|---|
| Window chrome | Traffic light buttons (red/yellow/green, top-left) | Minimize/maximize/close (top-right) | GNOME header bar with close button |
| Font | SF Pro (or -apple-system fallback) | Segoe UI | Cantarell |
| File manager | Finder (sidebar + icon grid) | File Explorer (ribbon + detail list) | Nautilus (sidebar + grid) |
| Dock/Taskbar | Bottom dock with magnification | Bottom taskbar with Start button | Top bar + Activities button |
| Terminal | white-on-black, zsh prompt style | Blue PowerShell or black CMD | Green-on-black, bash prompt |
| Colors | Gray chrome, blue accents | Blue/dark mode, Fluent design | Charcoal + purple (Adwaita) |

---

## 12. Business Model

### 12.1 Pricing Tiers

| Tier | Price | Includes | Target |
|---|---|---|---|
| **Explorer** | Free | 1 OS track, 10 lessons, basic sandbox, community forum | Casual explorers |
| **Switcher** | $12/mo | All 3 OS, unlimited lessons, save states, shortcut trainer, AI assistant, certificates | Active switchers |
| **Enterprise** | Custom | Team dashboard, custom paths, SSO, analytics, onboarding automation | IT departments |
| **Agent Free** | Free | 100 API calls/mo, 1 OS, basic tasks | Indie devs, researchers |
| **Agent Pro** | $99/mo | 10K calls/mo, all OS, full tasks, 10 parallel instances, logging | AI startups, labs |
| **Agent Enterprise** | Custom | Unlimited, 1000+ parallel, SLA, private deployment | AI labs, cloud providers |

### 12.2 Revenue Targets

| Segment | Year 1 | Year 2 |
|---|---|---|
| Human learning (Switcher tier) | $216K ARR | $600K ARR |
| Human learning (Enterprise) | $150K ARR | $400K ARR |
| Agent API (Pro) | — | $237K ARR |
| Agent API (Enterprise) | — | $250K ARR |
| Education/NGO licenses | — | $100K ARR |
| **Total** | **$366K ARR** | **$1.59M ARR** |

---

## 13. Go-to-Market Strategy

### Phase 1: Alpha (Months 1–4)
- macOS simulation + 10 beginner lessons
- Invite-only, 100 beta users
- Goal: Validate core UX, iterate on simulation fidelity

### Phase 2: Beta (Months 5–8)
- All 3 OS simulations, full beginner tracks
- Public waitlist, 2000 beta users
- Level Zero curriculum design + pilot with 1 NGO
- Internal Agent API prototype with 3 agent teams
- Goal: Test pricing and conversion

### Phase 3: Launch (Months 9–12)
- All tracks including Switcher paths, paid tiers live
- AI assistant, Agent Sandbox public API
- Goal: 1,500 paid subscribers, 10 enterprise pilots

### Phase 4: Scale (Months 13–18)
- Advanced tracks, certifications
- 10 languages for Level Zero, school/NGO partnerships
- Agent Enterprise tier, benchmark leaderboard
- Goal: $1M+ ARR

### Distribution Channels
- SEO: "how to switch from Windows to Mac", "learn macOS online", "Linux for beginners"
- YouTube tutorials with before/after comparisons
- Reddit: r/mac, r/linux, r/sysadmin, r/ITCareerQuestions
- Product Hunt / Hacker News launch
- Enterprise: LinkedIn, IT conferences
- Agent market: AI/ML conferences, research paper citations, GitHub integrations

---

## 14. Competitive Landscape

| Competitor | Hands-On | Guided | Multi-OS | Free Tier | Agent API | Notes |
|---|---|---|---|---|---|---|
| Udemy/LinkedIn Learning | No | Partial | Yes | No | No | Video-only |
| macos-web.app | Yes | No | No | Yes | No | Visual clone only |
| BrowserStack | Yes | No | Yes | No | No | Dev testing |
| OSWorld | Yes | No | Yes | Yes | Yes | Heavyweight VMs |
| CloudShare | Yes | Partial | Yes | No | No | Enterprise training |
| **SwitchOS** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Only combined solution** |

---

## 15. Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Apple trade dress objections | High | Frame as "inspired by" training. Avoid logos/exact icons. Consult IP attorney. |
| Simulation fidelity too low for learning transfer | Medium | Prioritize key interactions. User test with real switchers. |
| Agent misuse (malicious automation training) | High | Usage policies, rate limiting, abuse detection, responsible use terms. |
| Users churn after 1 track | Medium | Advanced tracks, certifications, daily tips, enterprise contracts. |
| Browser performance on low-end hardware | Medium | Canvas/WebGL optimization, progressive loading, "lite" mode. |
| Localization scale (10 languages) | Medium | Start with English + Spanish, AI-assisted translation with human review. |
| Scope creep across 3 use cases | Medium | Phase strictly: core product first, Level Zero and Agent API start Month 5. |
| Agent market standards shift | Medium | Build on open standards (MCP, A2A). Keep API flexible. Ship minimal, iterate. |
| A well-funded player builds similar | Low | Move fast, build community, focus on cross-OS value no single vendor offers. |

---

## 16. Success Criteria

### 6-Month Milestones
1. Alpha launch: macOS sim + 10 lessons
2. 500 beta signups, 70%+ lesson completion rate
3. Windows and Linux sims in beta
4. AI assistant integrated
5. First 3 enterprise pilot customers

### 12-Month Milestones
1. 1,500+ paid Switcher subscribers
2. 10 enterprise contracts signed
3. 120+ guided lessons across all tracks
4. NPS 50+ from paid users
5. $366K+ ARR
6. Agent Sandbox API in public beta

### 18–24 Month Vision
1. Mobile-responsive simulations (tablet-first)
2. Premium cloud VM tier
3. Certification partnerships (CompTIA, Apple, Microsoft)
4. API/embed mode for third-party LMS
5. Community lesson marketplace
6. Agent Sandbox used in 3+ published research papers

---

## 17. Appendix: Claude Code Implementation Guide

> **This section provides step-by-step instructions for Claude Code to build the MVP.**

### Phase 1: Project Setup

```bash
# 1. Initialize Next.js project with TypeScript
npx create-next-app@latest switchos --typescript --tailwind --eslint --app --src-dir

# 2. Install dependencies
cd switchos
npm install zustand prisma @prisma/client next-auth @auth/prisma-adapter
npm install -D @types/node

# 3. Initialize Prisma
npx prisma init

# 4. Copy the schema from Section 9 into prisma/schema.prisma

# 5. Set up database and generate client
npx prisma db push
npx prisma generate
```

### Phase 2: Build Order (Critical Path)

Build in this exact order. Each step depends on the previous:

```
Step 1: Simulation Engine Core
  → fileSystem.ts (virtual file system with CRUD)
  → windowManager.ts (open, close, focus, move, resize)
  → keyboardHandler.ts (shortcut registration and interception)
  → actionRecorder.ts (log all user actions)
  
Step 2: Zustand Store
  → Create unified store combining file system, window manager,
    active app, clipboard, and lesson state
  
Step 3: Desktop Shell Components
  → Desktop.tsx (main container, wallpaper, icon grid)
  → MenuBar.tsx (top bar with Apple menu, app name, clock)
  → Dock.tsx (bottom dock with app icons, trash)
  → DesktopIcon.tsx (draggable file/folder icons)
  → ContextMenu.tsx (right-click menus)
  → Window.tsx (draggable, resizable window frame with traffic lights)

Step 4: App Components
  → Finder.tsx (sidebar + file grid, column view, navigation)
  → TextEdit.tsx (simple text editor in a window)
  → Spotlight.tsx (Cmd+Space overlay with search)
  → SystemSettings.tsx (basic settings panels)
  → Terminal.tsx (basic command emulator)

Step 5: Lesson System
  → types.ts (all TypeScript interfaces)
  → loader.ts (load lesson JSON)
  → evaluator.ts (check completion conditions)
  → hintEngine.ts (timed hint delivery)
  → Write all 10 lesson JSON files

Step 6: Coach Panel
  → CoachPanel.tsx (sidebar with current step, hints, progress)
  → StepIndicator.tsx (visual step progress)
  → HintBubble.tsx (animated hint display)
  → CompletionModal.tsx (lesson complete celebration)

Step 7: Auth & Progress
  → NextAuth config with email/password + Google OAuth
  → Progress API routes
  → Dashboard page with track cards and progress bars

Step 8: Integration & Polish
  → Wire lesson system to simulation (initial state loading)
  → Wire evaluator to coach panel (auto-advance on completion)
  → Add animations (window open/close, dock bounce, step transitions)
  → Keyboard shortcut bar at bottom of sim view
```

### Phase 3: Simulation Component Specifications

#### Desktop.tsx
- Full viewport container with wallpaper background image
- Grid-based icon positioning (snaps to grid)
- Click on empty space = deselect all → right-click = context menu
- Renders all DesktopIcon components for items in `/Users/you/Desktop`
- Renders all open Window components from windowManager
- Renders MenuBar at top, Dock at bottom
- Intercepts all keyboard events → passes to keyboardHandler

#### Window.tsx
- Props: `windowId`, `title`, `appId`, `children` (app content)
- Draggable by title bar (mouse down on title bar → track mouse move)
- Resizable from edges and corners (cursor changes on hover)
- Traffic light buttons: red = close, yellow = minimize, green = maximize/restore
- Click anywhere in window → focus (bring to front via z-index)
- Minimum size constraints from WindowState
- Smooth CSS transitions for maximize/minimize animations

#### Finder.tsx
- Left sidebar: Favorites (Desktop, Documents, Downloads, Applications), Devices
- Main area: Icon grid view (default), List view, Column view (toggle buttons)
- Breadcrumb path bar showing current location
- Double-click folder → navigate into it
- Double-click file → open with default app (TextEdit for .txt)
- Right-click → context menu (New Folder, Get Info, Rename, Move to Trash)
- Toolbar: Back/Forward buttons, view toggle, search field
- Drag support: drag files between Finder windows or to Desktop/Trash

#### Dock.tsx
- Fixed bottom bar with app icons
- Icons: Finder, TextEdit, Terminal, System Settings, Trash
- Hover: magnification effect (scale up hovered icon + neighbors)
- Click: launch app or focus existing window
- Running apps: small dot indicator below icon
- Trash icon: changes appearance when items are in Trash
- Drag files to Trash icon → move to Trash

#### Spotlight.tsx
- Triggered by Cmd+Space (or clicking search icon in menu bar)
- Centered overlay with search input field
- As user types, shows filtered results from file system (files, folders, apps)
- Click result → open file/folder/app
- Escape → close Spotlight

#### Terminal.tsx
- Black background, monospace font, green/white text
- Simulated zsh prompt: `you@switchos ~ %`
- Supports commands: `ls`, `cd`, `mkdir`, `touch`, `rm`, `cp`, `mv`, `cat`, `pwd`, `clear`, `echo`
- Commands operate on the virtual file system
- Tab completion for file/folder names
- Command history with up/down arrows

### Phase 4: Key Implementation Notes

**State architecture (Zustand):**
```typescript
interface SimulationStore {
  // File system
  fileSystem: FileSystem;
  
  // Window management
  windows: Map<string, WindowState>;
  focusedWindowId: string | null;
  
  // Desktop
  desktopIcons: DesktopIconState[];
  wallpaper: string;
  
  // Clipboard
  clipboard: { type: 'cut' | 'copy'; nodeIds: string[] } | null;
  
  // Running apps
  runningApps: Set<string>;
  
  // Context menu
  contextMenu: { x: number; y: number; items: MenuItem[] } | null;
  
  // Lesson state
  currentLesson: Lesson | null;
  currentStepIndex: number;
  completedSteps: Set<string>;
  hintVisible: boolean;
  
  // Action recording
  actionRecorder: ActionRecorder;
  
  // Actions (all state mutations)
  // ... (file ops, window ops, lesson ops)
}
```

**CSS approach for OS fidelity:**
- Use CSS variables for all OS-specific colors/fonts/radii
- macOS: `--window-radius: 10px; --font: -apple-system, BlinkMacSystemFont;`
- Window shadows: `box-shadow: 0 22px 70px 4px rgba(0,0,0,0.56);`
- Dock: backdrop-filter blur, dark translucent background
- Menu bar: `backdrop-filter: blur(20px); background: rgba(255,255,255,0.8);`

**Performance considerations:**
- Use `React.memo` on all simulation components (they re-render on any state change)
- Virtual file system operations should be O(1) lookups (Map-based)
- Window drag: use `requestAnimationFrame`, not state updates on every mouse move
- Throttle action recording to avoid excessive state updates
- Lazy load app components (Terminal, Settings only when opened)

---

*End of Document — SwitchOS PRD v2.0*
