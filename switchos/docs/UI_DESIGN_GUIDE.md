# SwitchOS UI Design Guide

A reference for building a consistent, polished UI across all SwitchOS pages. Based on current best practices for Tailwind CSS 4, Next.js, React, and educational platform design.

---

## 1. Current Issues

The home page, dashboard, and learning track pages each feel like separate apps:

| Page | Background | Cards | Text | Accent Colors |
|------|-----------|-------|------|---------------|
| Home | Dark gradient (gray-900→800) | Semi-transparent dark | White | Single blue |
| Dashboard | Light (gray-50) | White + border | Dark gray | Blue, green, orange, purple |
| Learning Track | White | White + border | Dark gray | Minimal, muted |

**Root causes:**
- No shared design tokens — colors are hardcoded inline (`bg-gray-900`, `bg-blue-600`)
- No semantic color system — the same "blue" means "CTA" on one page and "stat card accent" on another
- No shared layout shell — each page builds its own header/navigation from scratch
- Dark vs. light is inconsistent — the marketing page is dark, the app pages are light, with no intentional transition

---

## 2. Design Principles

### 2.1 Consistency First
Every page should feel like it belongs to the same product. Shared navigation, shared color palette, shared spacing rhythm, shared component shapes.

### 2.2 Learn from the Leaders
- **Duolingo**: One primary action per screen. Generous whitespace. Celebratory feedback on success. Streaks and XP always visible but never blocking. Progress visualized as a path.
- **Codecademy**: Split-pane layout for lessons (instructions + interactive editor). Step-by-step progress bars. Progressive hint disclosure.
- **Khan Academy**: Mastery-based progress. Warm illustration style. Points and badges for motivation.

### 2.3 The Simulation is a Special Zone
The simulated macOS desktop uses Apple's visual language. The surrounding platform (dashboard, coach panel, navigation) uses SwitchOS's own design system. These are two distinct visual contexts — the coach panel bridges them.

### 2.4 Educational Content Needs Breathing Room
More whitespace than a typical SaaS dashboard. Users are learning, not optimizing for throughput. Don't crowd the interface.

### 2.5 Accessibility
- Minimum 4.5:1 contrast ratio for body text, 3:1 for large text (WCAG AA)
- Focus-visible indicators on all interactive elements (already partially in place)
- Never rely solely on color to convey meaning — pair with icons or labels
- Keyboard-navigable simulation for lesson completion

---

## 3. Design Token System (Tailwind CSS 4)

Tailwind CSS 4 uses `@theme` blocks in CSS instead of `tailwind.config.js`. All tokens become both CSS custom properties and Tailwind utilities automatically.

### 3.1 Color Palette

Choose **one** theme direction and commit to it. Recommendation: **light base with a dark navigation bar** (similar to the current home page header but applied consistently). This preserves the premium feel of the dark nav while keeping content areas readable.

```css
@theme inline {
  /* --- Brand --- */
  --color-primary: oklch(0.55 0.22 265);         /* Vibrant blue — CTAs, links, active states */
  --color-primary-hover: oklch(0.48 0.22 265);
  --color-primary-light: oklch(0.92 0.05 265);   /* Light tint for backgrounds */

  /* --- Surfaces --- */
  --color-surface-0: oklch(0.97 0.003 265);      /* Page background (off-white) */
  --color-surface-1: oklch(1.0 0 0);              /* Card background (white) */
  --color-surface-2: oklch(0.95 0.003 265);       /* Elevated/nested surfaces */
  --color-surface-dark: oklch(0.16 0.02 265);     /* Nav bar, footer, hero sections */
  --color-surface-dark-elevated: oklch(0.22 0.02 265);  /* Cards on dark surfaces */

  /* --- Text --- */
  --color-on-surface: oklch(0.15 0.01 265);       /* Primary text on light bg */
  --color-on-surface-muted: oklch(0.45 0.01 265); /* Secondary/description text */
  --color-on-dark: oklch(0.95 0.005 265);         /* Primary text on dark bg */
  --color-on-dark-muted: oklch(0.70 0.01 265);    /* Secondary text on dark bg */

  /* --- Borders --- */
  --color-border: oklch(0.88 0.005 265);          /* Default border */
  --color-border-hover: oklch(0.78 0.01 265);     /* Border on hover */

  /* --- Semantic --- */
  --color-success: oklch(0.65 0.19 155);          /* Completion, correct answers */
  --color-success-light: oklch(0.92 0.05 155);
  --color-warning: oklch(0.78 0.15 75);           /* Hints, caution */
  --color-warning-light: oklch(0.94 0.04 75);
  --color-danger: oklch(0.60 0.22 25);            /* Errors, destructive actions */
  --color-danger-light: oklch(0.93 0.05 25);
  --color-xp: oklch(0.75 0.17 85);               /* XP, rewards — gold/amber */
  --color-xp-light: oklch(0.94 0.05 85);

  /* --- Track accent colors (one per OS track) --- */
  --color-track-macos: oklch(0.55 0.22 265);     /* Blue */
  --color-track-windows: oklch(0.55 0.20 240);   /* Teal-blue */
  --color-track-linux: oklch(0.60 0.20 310);     /* Purple */
}
```

**Key rules:**
- **Always use semantic tokens in components**, never raw colors (`bg-primary` not `bg-blue-600`)
- Surface + on-surface are always paired for guaranteed contrast
- Each OS track gets its own accent color for visual identity
- Use OKLCH color space for perceptually uniform color manipulation

### 3.2 Typography

```css
@theme inline {
  --font-sans: var(--font-geist-sans);    /* Already in use — keep */
  --font-mono: var(--font-geist-mono);    /* Already in use — keep */

  /* Type scale */
  --font-size-display: 2.5rem;    /* 40px — hero headings */
  --font-size-h1: 1.875rem;       /* 30px — page titles */
  --font-size-h2: 1.5rem;         /* 24px — section headings */
  --font-size-h3: 1.25rem;        /* 20px — card titles */
  --font-size-body: 1rem;          /* 16px — body text */
  --font-size-sm: 0.875rem;       /* 14px — secondary text, labels */
  --font-size-xs: 0.75rem;        /* 12px — captions, badges */
}
```

**Typography hierarchy rules:**
- Use **weight** (not just size) to create hierarchy: 700 for headings, 500 for emphasis, 400 for body
- Line height decreases as size increases: body at 1.6, headings at 1.2–1.3
- Limit to 2 font families max (Geist Sans + Geist Mono is correct)
- Max reading width: `max-w-prose` (~65ch) for body text

### 3.3 Spacing

Use Tailwind's default base-4 spacing scale consistently:

| Token | Value | Use for |
|-------|-------|---------|
| `gap-1` / `p-1` | 4px | Tight inline spacing (icon + label) |
| `gap-2` / `p-2` | 8px | Compact element spacing |
| `gap-3` / `p-3` | 12px | Small card padding |
| `gap-4` / `p-4` | 16px | Default card padding, element gaps |
| `gap-6` / `p-6` | 24px | Generous card padding, section gaps |
| `gap-8` | 32px | Between sections |
| `gap-12` | 48px | Between major page sections |
| `gap-16` | 64px | Page-level vertical rhythm |

**Rules:**
- Cards: always `p-6` (24px) internal padding
- Section gaps: always `gap-8` or `gap-12` between major sections
- Page container: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- Be consistent — if lesson cards use `p-6`, track cards should too

### 3.4 Border Radius

Pick one radius convention and apply it everywhere:

```css
@theme inline {
  --radius-sm: 0.375rem;   /* 6px — badges, tags, small inputs */
  --radius-md: 0.5rem;     /* 8px — buttons, inputs */
  --radius-lg: 0.75rem;    /* 12px — cards, dialogs */
  --radius-xl: 1rem;       /* 16px — large feature cards, hero sections */
  --radius-full: 9999px;   /* Fully rounded — avatars, pills */
}
```

**Rules:**
- Cards: always `rounded-lg`
- Buttons: always `rounded-md`
- Avatars & pills: always `rounded-full`
- Stay consistent — don't mix `rounded-xl` on one card and `rounded-lg` on another

### 3.5 Shadows

```
shadow-sm   → Subtle lift for cards at rest
shadow-md   → Hover state for interactive cards
shadow-lg   → Modals, popovers, elevated surfaces
```

Use shadows sparingly on light backgrounds. Pair with border for definition. Interactive cards: `shadow-sm` at rest, `shadow-md` on hover with `transition-shadow`.

---

## 4. Layout Patterns

### 4.1 Shared Page Shell

Every platform page (dashboard, tracks, profile) should share the same structural shell:

```
┌─────────────────────────────────────────────────┐
│  Top Bar (dark bg)                              │
│  Logo | Nav Links | XP | Streak | Avatar        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Content Area (light bg, max-width container)   │
│                                                 │
│    Page Title + Description                     │
│    ─────────────────────                        │
│    Section 1                                    │
│    ─────────────────────                        │
│    Section 2                                    │
│                                                 │
├─────────────────────────────────────────────────┤
│  Footer (dark bg, minimal)                      │
└─────────────────────────────────────────────────┘
```

- **Top bar**: Dark background (`surface-dark`), consistent across all pages. Shows logo, navigation, user stats (XP, streak), and avatar.
- **Content area**: Light background (`surface-0`), centered with `max-w-6xl`, consistent padding.
- **Footer**: Matches the top bar. Dark, minimal.

This approach resolves the dark/light split — the chrome is dark (premium feel), the content is light (readable).

### 4.2 Marketing vs. Platform Layouts

Use Next.js route groups to separate concerns:

- `(marketing)/` — Landing page, about, pricing. Full dark hero is fine here.
- `(platform)/` — Dashboard, tracks, lessons, profile. Shared top bar + content shell.

The marketing pages can be more expressive. The platform pages must be consistent.

### 4.3 Content Grid

```
1 column:   mobile default
2 columns:  md breakpoint (768px) — dashboard stats, track cards
3 columns:  lg breakpoint (1024px) — feature cards, lesson cards
```

Use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` as the standard content grid.

---

## 5. Component Patterns

### 5.1 Card

The most-used component. Must look identical whether on the dashboard, track page, or profile.

```
┌──────────────────────────────┐
│  [Optional color accent bar] │  ← 3px top border in track color
│                              │
│  Icon or Emoji               │
│  Title (h3, font-semibold)   │
│  Description (muted, 2 lines)│
│                              │
│  Meta: progress bar, time,   │
│        step count            │
└──────────────────────────────┘
```

**Styles:**
- `bg-surface-1 rounded-lg border border-border p-6`
- Hover (if interactive): `hover:shadow-md hover:border-border-hover transition-all`
- Track accent: 3px `border-t` in the track's accent color
- Coming soon: `opacity-50` + "Coming Soon" badge, no hover effect

### 5.2 Button

Two variants, consistent everywhere:

**Primary**: `bg-primary text-white rounded-md px-4 py-2 font-medium hover:bg-primary-hover transition-colors`
**Secondary**: `bg-surface-1 text-on-surface border border-border rounded-md px-4 py-2 font-medium hover:bg-surface-2 transition-colors`

**Rules:**
- Always include `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
- Disabled state: `opacity-50 cursor-not-allowed`
- Loading state: spinner icon replacing text or inline

### 5.3 Badge / Pill

For status indicators, XP, lesson count, "Coming Soon":

- `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`
- Variant colors: `bg-success-light text-success`, `bg-warning-light text-warning`, `bg-primary-light text-primary`

### 5.4 Progress Bar

Used for track completion, lesson step progress, XP toward next level:

```
Outer: h-2 rounded-full bg-surface-2
Inner: h-full rounded-full bg-primary transition-all duration-500
```

- Track progress: use the track's accent color
- Lesson steps: use `bg-primary`
- XP: use `bg-xp`

### 5.5 Stat Card

For the dashboard metrics (Lessons Completed, XP Earned, Day Streak, Badges):

```
┌─────────────────┐
│  Large number    │  ← text-3xl font-bold, colored per metric
│  Label           │  ← text-sm text-on-surface-muted
└─────────────────┘
```

Use semantic colors: XP → `text-xp`, Streak → `text-warning`, Badges → `text-primary`, Lessons → `text-success`.

---

## 6. Gamification UI Patterns

### 6.1 XP Counter (Top Bar)
- Display current XP with a small icon
- On XP gain: animate with a counting-up effect and a brief flash/pulse
- Consider showing XP-to-next-level as a thin progress bar beneath the counter

### 6.2 Streak Display
- Calendar-style heat map or simple flame icon + number
- Highlight "at risk" state if the user hasn't practiced today
- On streak continuation: celebratory micro-animation

### 6.3 Lesson Completion Overlay
Full-screen celebration when a lesson finishes:
- Large checkmark or confetti animation
- Stats: time spent, hints used, XP earned
- Clear CTA: "Next Lesson" or "Back to Track"
- Use `bg-success` tones and generous whitespace

### 6.4 Step Indicator (Within Lessons)
- Horizontal stepper at the top of the coach panel
- Completed steps: filled circles in `bg-success`
- Current step: filled circle in `bg-primary` with subtle pulse
- Future steps: outlined circles in `border-border`

### 6.5 Achievement Badges
- Consistent shape (circle)
- Locked: grayscale, slightly transparent
- Earned: vibrant, full color, subtle glow/shadow
- Display in a grid on the profile or dashboard

---

## 7. Theme Strategy — Resolving the Dark/Light Split

### Recommended Approach: Dark Chrome, Light Content

Rather than choosing all-dark or all-light, use a **split approach**:

1. **Navigation bar + footer**: Always dark (`surface-dark`). This gives the premium feel of the current home page.
2. **Content areas**: Always light (`surface-0` / `surface-1`). Readable, clean, educational.
3. **Marketing hero**: Can go full-dark as a special case, but the nav bar should match the platform nav bar exactly.
4. **Simulation desktop**: Its own visual context (macOS appearance). Visually bounded by a frame/shadow.

This means:
- The home page hero section stays dark — but the nav bar becomes the shared platform nav bar
- The dashboard and track pages use the same dark nav bar + light content
- Visual continuity is maintained as users navigate between pages

### Optional: Full Dark Mode Toggle

If you want to support user-toggled dark mode later:
- Use `next-themes` for flash-free theme switching
- Override CSS variables per theme using `@media (prefers-color-scheme: dark)` or `.dark` class
- The simulation desktop stays in macOS appearance regardless of platform theme
- Ensure all semantic tokens have dark-mode equivalents

---

## 8. Practical Remediation Checklist

These are the specific inconsistencies to fix, in priority order:

### High Priority
- [ ] Define semantic color tokens in `globals.css` `@theme inline` block (replace hardcoded colors)
- [ ] Create a shared `PageShell` component (dark top bar + light content area + footer)
- [ ] Apply `PageShell` to dashboard and track pages
- [ ] Update home page nav bar to match `PageShell` top bar exactly
- [ ] Replace all raw color classes (`bg-gray-900`, `bg-blue-600`) with semantic tokens (`bg-surface-dark`, `bg-primary`)

### Medium Priority
- [ ] Standardize card component (same padding, border-radius, border, hover behavior)
- [ ] Standardize button styles (primary + secondary variants)
- [ ] Add track accent colors to track cards (colored top border)
- [ ] Consistent typography hierarchy across all pages

### Lower Priority
- [ ] Add loading skeletons (`loading.tsx`) for dashboard and track pages
- [ ] Add XP/streak display to the shared top bar
- [ ] Add micro-animations for gamification feedback (XP gain, step completion)
- [ ] Add lesson completion celebration overlay
- [ ] Build reusable `Badge`, `ProgressBar`, `StatCard` components in `src/components/ui/`

---

## Sources

- [Tailwind CSS 4 Best Practices 2025-2026: Design Tokens](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [A Dev's Guide to Tailwind CSS in 2026 — LogRocket](https://blog.logrocket.com/tailwind-css-guide/)
- [10 Tailwind CSS Best Practices for 2026](https://benjamincrozat.com/tailwind-css)
- [Tailwind CSS Best Practices & Design System Patterns — DEV](https://dev.to/frontendtoolstech/tailwind-css-best-practices-design-system-patterns-54pi)
- [How to Design Like Duolingo: Gamification & Engagement](https://www.uinkits.com/blog-post/how-to-design-like-duolingo-gamification-engagement)
- [Gamification in Product Design in 2025 (UI/UX)](https://arounda.agency/blog/gamification-in-product-design-in-2024-ui-ux)
- [10 Powerful Gamification Examples in Education for 2026](https://www.polychatapp.com/blog/gamification-examples-in-education)
- [7 Best Designed Edtech Platforms — Merge](https://merge.rocks/blog/7-best-designed-edtech-platforms-weve-seen-so-far)
- [next-themes — Perfect Next.js Dark Mode](https://github.com/pacocoursey/next-themes)
- [shadcn/ui Dark Mode for Next.js](https://ui.shadcn.com/docs/dark-mode/next)
- [Tailwind CSS Dark Mode Tutorial — Prismic](https://prismic.io/blog/tailwind-css-darkmode-tutorial)
