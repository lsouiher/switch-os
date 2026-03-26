# SwitchOS Setup Guide

## Local Development

### Prerequisites

- Node.js 20+
- Docker Desktop (runs the database -- no need to install PostgreSQL directly)

### 1. Install dependencies

```bash
cd switchos
npm install
```

### 2. Start the database

```bash
npm run db:setup
```

**What this does:**

1. `docker compose up -d` starts a PostgreSQL 16 container. This is the database server -- it runs inside Docker, not installed on your machine. You can see it with `docker ps`.
2. `npx prisma migrate dev` connects to that container and creates all the tables (User, LessonProgress, etc.) defined in `prisma/schema.prisma`.

Data persists across Docker restarts via a named volume (`pgdata`). Stop and start freely without losing data.

### Database commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run db:setup` | Starts container + runs migrations | First time setup |
| `npm run db:up` | Starts the database container | After a reboot or `db:down` |
| `npm run db:down` | Stops the database container | When you're done developing |
| `npm run db:migrate` | Applies schema changes to the DB | After editing `prisma/schema.prisma` |

### How Prisma migrations work

Prisma is the ORM (like Entity Framework for SQL Server, or Mongoose for MongoDB). Key concepts:

- **`prisma/schema.prisma`** -- defines your tables and columns (like a DDL script or Mongoose schema)
- **`prisma/migrations/`** -- auto-generated SQL files that Prisma applies in order (like DB2 migration scripts)
- **`npx prisma migrate dev`** -- compares your schema to the DB, generates a migration SQL file, and applies it. Use during development.
- **`npx prisma migrate deploy`** -- applies pending migrations without generating new ones. Use in CI/production.
- **`npx prisma generate`** -- regenerates the TypeScript client after schema changes (run automatically by `migrate dev`)

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Create a test account

Go to [http://localhost:3000/register](http://localhost:3000/register) and create an account. This enables server-side progress persistence.

Progress also saves to localStorage as a fallback, so lessons work without logging in -- but the dashboard stats (XP, streak, badges) require authentication.

### Environment Variables

A `.env` file should already exist. If not, copy from `.env.example`:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string to the Postgres container | `postgresql://user:password@localhost:5432/switchos` |
| `NEXTAUTH_SECRET` | Signs session cookies | `change-me-to-a-random-secret` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |

The defaults work out of the box for local development. For production, generate a real secret:

```bash
openssl rand -base64 32
```

---

## CI/CD with GitHub Actions

The workflow at `.github/workflows/ci.yml` runs automatically on every push and pull request to `main`:

1. **Lint** -- runs ESLint to catch code issues
2. **Build** -- spins up a temporary PostgreSQL service container in GitHub's runner, applies migrations, and compiles the Next.js production build

No manual setup needed -- GitHub Actions provides the runner and the Postgres service container.

### Required GitHub Secrets for Deployment

If you add a deployment step (e.g., to Vercel, Railway, or a VPS), set these in your repo's **Settings > Secrets and variables > Actions**:

| Secret | Value |
|--------|-------|
| `DATABASE_URL` | Production PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Production URL (e.g., `https://switchos.app`) |

### Running the CI checks locally

You can simulate what CI does before pushing:

```bash
npm run lint
npm run build
```

---

## Production Build

```bash
npm run build    # Compile the app
npm run start    # Serve on port 3000
```

In production, use `npx prisma migrate deploy` (not `migrate dev`) -- it applies pending migrations without prompting or auto-generating new ones.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Can't reach database server at localhost:5432` | Run `npm run db:up` to start the Docker container |
| `docker: command not found` | Install Docker Desktop |
| Port 5432 already in use | Another Postgres or service is using the port. Stop it or change the port in `docker-compose.yml` and `.env` |
| Migrations out of sync | Run `npm run db:migrate` to apply pending changes |
| Progress not saving | Make sure you're logged in, and the DB container is running |

---

## Project Structure (key files)

```
switchos/
  docker-compose.yml           # Runs PostgreSQL in Docker
  prisma/
    schema.prisma              # Database tables and columns
    migrations/                # Auto-generated SQL migration files
  .env                         # Environment variables (git-ignored)
  .env.example                 # Template for .env
  .github/workflows/ci.yml    # GitHub Actions CI pipeline
  src/
    app/                       # Next.js pages and API routes
    components/simulation/     # macOS and Windows simulation UI
    hooks/useProgressSync.ts   # Progress persistence (server + localStorage)
    lessons/content/           # Lesson JSON files
    store/                     # Zustand state management
    simulation/                # OS config, file system, shortcuts
```
