# SwitchOS

**Learn Any Operating System, Without the Machine**

SwitchOS is a browser-based platform that provides interactive, hands-on training environments for learning macOS, Windows, and Linux. Users are placed inside a realistic simulated desktop with guided lessons that walk them through real-world tasks and workflows.

## Who It's For

- **OS Switchers** — Transitioning between operating systems (e.g., Windows to macOS) and need hands-on practice
- **First-Time Computer Users** — Students, seniors, and new users learning to use a computer for the first time
- **AI Agent Developers** — Teams building AI agents that need lightweight OS environments for training and benchmarking

## Features

- Realistic simulated desktop environment (Menu Bar, Dock, Finder, Terminal, Spotlight, System Settings, and more)
- Guided lesson tracks with step-by-step instructions
- Built-in coaching with contextual hints
- Progress tracking with XP, streaks, and badges
- User authentication and saved progress

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/switch-os.git
cd switch-os/switchos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and auth secret

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the dev server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
switchos/
├── prisma/              # Database schema
├── src/
│   ├── app/             # Next.js app router pages and API routes
│   ├── components/
│   │   ├── learning/    # Coach panel, hints, step indicators
│   │   └── simulation/  # Desktop, Dock, Finder, Terminal, etc.
│   ├── hooks/           # Custom React hooks
│   ├── lessons/         # Lesson loader, evaluator, and hint engine
│   │   └── content/     # Lesson JSON files organized by track
│   ├── lib/             # Auth and database config
│   ├── simulation/      # File system, window manager, keyboard handler
│   └── store/           # Zustand state management
└── public/              # Static assets
```

## Current Lesson Tracks

### macOS Foundations
1. Desktop Basics
2. Dock and Apps
3. Finder Navigation
4. Creating Files and Folders
5. Moving and Copying
6. Spotlight Search
7. System Settings
8. Keyboard Shortcuts
9. Multiple Windows
10. Trash and Cleanup

## License

All rights reserved.
