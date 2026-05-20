# DecisionVault — Full Application Documentation

> **Your mind. Recorded. Refined.**  
> A high-fidelity decision journal for serious thinkers.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [Layout System](#layout-system)
6. [Pages](#pages)
   - [Landing Page](#landing-page)
   - [Auth](#auth)
   - [Dashboard](#dashboard)
   - [New Decision](#new-decision)
   - [Decision Detail](#decision-detail)
   - [Review Mode](#review-mode)
   - [All Decisions](#all-decisions)
   - [Insights](#insights)
   - [Settings](#settings)
   - [Pricing](#pricing)
   - [Not Found (404)](#not-found-404)
7. [Global UX Patterns](#global-ux-patterns)
8. [Animations & Visual Design](#animations--visual-design)
9. [Database Schema](#database-schema)
10. [Deployment](#deployment)
11. [Environment Variables](#environment-variables)
12. [Development Commands](#development-commands)

---

## Overview

DecisionVault is a **decision journaling SaaS application** built with React, TypeScript, and Supabase. Users log their decisions with structured context, predicted outcomes, and confidence levels. After a defined review period, the app prompts users to review the actual outcome, enabling them to track and improve their decision-making accuracy over time.

### Key Features

- **Decision Logging** — Structured entry with title, context, categories, confidence, predicted outcome, and review timeline.
- **Review System** — Automated review reminders with timed notifications based on user-defined cadence.
- **Analytics Dashboard** — Visual insights including accuracy over time, calibration curves, and category distribution.
- **Responsive Design** — Fully functional mobile web app experience with slide-out navigation.
- **Celebration Effects** — Confetti and toast notifications on key user actions.
- **Real-time Sync** — Live updates via Supabase real-time subscriptions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Animation | Framer Motion (`motion/react`) |
| 3D/Visuals | React Three Fiber + Drei |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Hosting | Netlify |
| CI/CD | GitHub Actions |

---

## Project Structure

```
decision-vault-main/
├── .github/workflows/          # CI/CD pipelines
│   └── deploy.yml              # Auto-deploy to Netlify
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── layout/             # Shell components
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── three/              # 3D scene components
│   │   └── ui/                 # shadcn/ui primitives
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── context/
│   │   └── AuthContext.tsx     # Global auth state & profile
│   ├── lib/
│   │   ├── gsap.ts             # GSAP utilities
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # cn() helper
│   ├── pages/                  # Route-level components
│   │   ├── AllDecisions.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DecisionDetail.tsx
│   │   ├── Insights.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NewDecision.tsx
│   │   ├── NotFound.tsx
│   │   ├── Pricing.tsx
│   │   ├── ReviewMode.tsx
│   │   └── Settings.tsx
│   ├── App.tsx                 # Router, animations, guards
│   ├── index.css               # Global styles, theme, utilities
│   └── main.tsx                # Entry point
├── .env.local                  # Secrets (not committed)
├── .env.example                # Template for env vars
├── index.html                  # HTML entry
├── netlify.toml                # Netlify build config
├── package.json
├── supabase-setup.sql          # Database schema
├── tsconfig.json
└── vite.config.ts
```

---

## Authentication & Authorization

### Supabase Auth Integration

Authentication is handled via Supabase Auth with email/password flows. The `AuthContext` provides:

- `user` — current Supabase user object
- `profile` — extended user profile (display name, role, plan, review cadence)
- `signIn()`, `signUp()`, `signOut()` — auth methods
- `loading` — auth initialization state

### Route Guards

`App.tsx` implements route guards:
- **Protected routes** (`/dashboard`, `/decisions`, etc.) redirect unauthenticated users to `/auth`
- **Guest routes** (`/auth`) redirect authenticated users to `/dashboard`

### Profile Schema

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  role text,
  plan text default 'Free',
  review_cadence integer default 7,
  created_at timestamp with time zone default now()
);
```

---

## Layout System

### Layout Types

| Layout | Used By | Description |
|---|---|---|
| `Layout` | Landing, Auth, Pricing | Full-width public layout with Navbar and footer |
| `DashboardLayout` | All app pages | Sidebar + main content area with floating action button |

### Sidebar

- **Desktop**: Fixed left sidebar, always visible, 280px wide
- **Mobile**: Hidden by default, slides in with spring animation, body scroll lock, backdrop overlay
- **Nav Items**: Dashboard, My Decisions, Reviews Due (with badge count), Insights, Settings
- **Bottom**: User mini-profile, upgrade CTA, Sign Out button

### Navbar (Public Layout)

- Transparent on scroll top, blurred background on scroll
- Desktop: Links + CTA buttons
- Mobile: Hamburger menu with dropdown + overlay

### Custom Cursor

- GPU-accelerated custom dot cursor on desktop
- Scales up on hover over clickable elements
- **Disabled entirely on touch/mobile devices** to save battery

---

## Pages

### Landing Page

**Route**: `/`

The marketing homepage with luxury aesthetic:

- **Hero Section**: Animated headline, staggered entrance text, 3D wireframe trophy visualization via React Three Fiber
- **Counter Stats**: Animated counting numbers (decisions logged, accuracy tracked, thinkers joined)
- **Manifesto Section**: Philosophy of high-quality decision making
- **Feature Grid**: Cards explaining core features with hover effects
- **CTA Section**: Final call-to-action to sign up
- **Footer**: Links, branding, system status indicator

**Animations**: Staggered fade-ins, floating orbs, rotating icon on logo hover

---

### Auth

**Route**: `/auth?mode=login|signup`

Dual-mode authentication page:

- **Left Panel**: 3D visualization (desktop only), app branding, tagline
- **Right Panel**: Toggle between Login and Sign Up forms
- **Login**: Email + password with "Remember me" option
- **Sign Up**: Email + password + password strength indicator (Weak → Strong with color coding)
- **Form Validation**: Required fields, password length checks
- **Transitions**: Smooth cross-fade animation between modes

**UX Details**:
- Password strength bar with 4 levels and color feedback
- Loading spinners on submit buttons
- Toast notifications for errors and success

---

### Dashboard

**Route**: `/dashboard` (Protected)

The user's command center:

- **Stats Cards**: Total decisions, accuracy percentage, reviews due, active streak
- **Accuracy Calculation**: Computed from actual review data (not mock) — maps `outcomeMatch` (`yes`→100%, `partial`→50%, `no`→0%)
- **Chart**: Accuracy trend over time using Recharts `LineChart`
- **Quick Insight Panel**: Dynamic tip based on user's decision volume
- **Recent Decisions Table**: Last 5 decisions with status badges
- **Empty State**: Elegant illustration when no decisions exist

**Responsive**:
- Desktop: Full table layout
- Mobile: Stacked cards with key info

---

### New Decision

**Route**: `/new-decision` (Protected)

Multi-step decision entry form:

- **Step 1 — Details**: Title, context textarea, category tags
- **Step 2 — Prediction**: Confidence slider (1-100), predicted outcome textarea
- **Step 3 — Review Schedule**: Date picker for review due date
- **Step 4 — Preview**: Summary of all entered data
- **Progress Indicator**: Step counter with visual progress bar

**UX Features**:
- Confetti celebration on save
- Toast notification: "Decision logged successfully"
- Form validation prevents submission with empty required fields
- Back/Next navigation between steps
- Auto-redirect to dashboard after save

---

### Decision Detail

**Route**: `/decision/:id` (Protected)

Full view of a single decision:

- **Header**: Title, status badge, back button
- **Confidence Ring**: SVG circular visualization of confidence level with color coding
- **Info Grid**: Created date, review due date, category tags
- **Context & Prediction**: Full text display
- **Action Buttons**: Edit, Delete (with confirmation), Start Review
- **Review History**: List of past reviews if available

**Status Badges**:
- `Active` — gold
- `Awaiting Review` — amber
- `Reviewed` — emerald

---

### Review Mode

**Route**: `/decision/:id/review` (Protected)

Structured decision review form:

- **Decision Recap**: Shows original context and prediction for reference
- **Actual Outcome**: Large textarea for describing what actually happened
- **Outcome Match**: Radio buttons — Yes, Partially, No
- **Confidence Reflection**: Slider to rate post-outcome confidence
- **Notes**: Optional additional reflection

**Celebration Flow**:
1. Validation check (required fields)
2. Supabase insert into `reviews` table
3. Update decision status to `Reviewed`
4. **Confetti burst** via `canvas-confetti`
5. **Toast success**: "Review completed!"
6. **Trophy celebration screen** with animated badge

**Responsive**:
- Mobile: Full-width textareas with comfortable touch targets
- Sticky submit button on scroll

---

### All Decisions

**Route**: `/decisions` (Protected)

Decision list with advanced filtering:

- **Search Bar**: Real-time text search across titles and context
- **Clear Button**: One-click search reset
- **Category Filter Chips**: All, Business, Hiring, Investment, Product, Personal
- **Reviews Toggle**: "Show reviews due only" switch
- **Desktop View**: Full data table with columns (Title, Category, Confidence, Status, Due Date)
- **Mobile View**: Card layout with key info stacked vertically
- **Empty State**: Illustrated empty state with "Log your first decision" CTA

**Filter Logic** (memoized with `useMemo`):
```typescript
matchesSearch && matchesCategory && matchesReviewDue
```

---

### Insights

**Route**: `/insights` (Protected)

Data analytics and visualization page:

- **Accuracy Over Time**: `LineChart` showing accuracy trend across reviews
- **Calibration Curve**: `ScatterChart` with `ReferenceLine` diagonal (predicted vs actual)
  - Gold dots for each decision
  - Dashed diagonal line showing perfect calibration
- **Category Distribution**: `PieChart` showing decision breakdown by category
- **Key Metrics**: Total reviews, average confidence, best category

**Chart Fixes**:
- Uses `ReferenceLine` (not invalid `<Line>`) inside `ScatterChart`
- Responsive container with `min-height` for mobile

**Animations**: Page entrance with `motion.div` fade-in

---

### Settings

**Route**: `/settings` (Protected)

User profile and account management:

- **Profile Settings**: Display name, role, review cadence selector (7, 14, 30, 90 days)
- **Plan Display**: Current plan badge
- **Account Actions**:
  - Sign Out
  - Delete Account (with confirmation modal)
- **Danger Zone**: Red-styled destructive actions

**Review Cadence**: Controls default review timeline for new decisions

---

### Pricing

**Route**: `/pricing`

Pricing plan comparison:

- **Free Plan**: Basic decision logging, limited reviews
- **Strategist Plan** ($12/mo): Unlimited decisions, advanced insights, priority support
- **Feature Comparison Table**: Side-by-side feature list
- **CTA Buttons**: "Get Started" or "Upgrade" based on auth state

---

### Not Found (404)

**Route**: `*` (catch-all)

Styled 404 error page:

- Large "404" display with glitch-style animation
- Friendly error message
- Navigation options: Back to home, Dashboard (if logged in)
- Consistent with luxury dark theme

---

## Global UX Patterns

### Toast Notifications

Powered by `react-hot-toast`:
- **Success**: Green checkmark on save, review completion, login
- **Error**: Red X on validation failures, network errors
- **Loading**: Spinner during async operations

### Page Transitions

`AnimatePresence` in `App.tsx` wraps all routes:
- Exit: fade out + slide up (`opacity: 0, y: -12`)
- Enter: fade in + slide up (`opacity: 1, y: 0`)
- Duration: 350ms with custom easing

### Scroll-to-Top

Automatic scroll reset on every route change via `useEffect` in `App.tsx`.

### Floating Action Button

Fixed bottom-right button (visible on all dashboard pages):
- Mobile: 56×56, positioned `bottom-6 right-6`
- Desktop: 64×64, positioned `bottom-12 right-12`
- Gold glow effect, hover rotation animation
- Tooltip on desktop: "Log a Decision"

---

## Animations & Visual Design

### Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#080C14` | Primary dark background |
| Surface | `#0D1117` | Cards, panels |
| Gold Accent | `#F5A623` | CTAs, highlights, badges |
| Gold Light | `#FFD166` | Hover states |
| Text Primary | `white/90` | Headings |
| Text Secondary | `white/50` | Body text |
| Font Display | Playfair Display | Headlines |
| Font Mono | JetBrains Mono | Labels, data |

### CSS Utilities

- `.glass-card` — Frosted glass effect with border and backdrop blur
- `.gold-glow` — Gold box-shadow glow for CTAs
- `.mesh-orb` — Large blurred gradient orbs for background depth
- `.noise-overlay` — Subtle grain texture overlay

### Animation System

| Animation | Implementation |
|---|---|
| Page transitions | Framer Motion `AnimatePresence` + `motion.div` |
| Staggered lists | `staggerChildren: 0.1` |
| Hover effects | Tailwind `group-hover` + transitions |
| Number counting | Custom hook with `requestAnimationFrame` |
| Confetti | `canvas-confetti` on review completion |
| 3D visuals | React Three Fiber (simplified trophy wireframe) |

---

## Database Schema

### Tables

#### `decisions`
```sql
create table decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  context text,
  categories text[] default '{}',
  confidence integer default 50,
  predicted_outcome text,
  review_due_at timestamp with time zone,
  status text default 'Active',
  created_at timestamp with time zone default now()
);
```

#### `reviews`
```sql
create table reviews (
  id uuid default gen_random_uuid() primary key,
  decision_id uuid references decisions on delete cascade not null,
  user_id uuid references auth.users not null,
  actual_outcome text,
  outcome_match text, -- 'yes', 'partial', 'no'
  confidence_after integer,
  notes text,
  created_at timestamp with time zone default now()
);
```

#### `profiles`
(See Authentication section)

### Row Level Security

All tables have RLS enabled with policies ensuring users can only access their own data:
```sql
policy "Users can only access own decisions"
  on decisions for all
  using (auth.uid() = user_id);
```

---

## Deployment

### Vercel Configuration

`vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Vercel auto-detects Vite projects. The build command (`vite build`) and output directory (`dist`) are handled automatically.

### GitHub Actions CI/CD

`.github/workflows/deploy.yml`:
- Triggers on push to `main`
- Installs dependencies, builds, deploys to Vercel
- Required secrets:
  - `VERCEL_TOKEN` — from Vercel account settings
  - `VERCEL_ORG_ID` — from `vercel` CLI or project settings
  - `VERCEL_PROJECT_ID` — from `vercel` CLI or project settings

### Manual Deploy
```bash
npm run build
npx vercel --prod
```

Or import your GitHub repository directly in the [Vercel Dashboard](https://vercel.com/new) for zero-config automatic deploys on every push.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

Copy `.env.example` to `.env.local` and fill in values.

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check (no emit)
npx tsc --noEmit

# Lint
npm run lint
```

---

## Mobile-Specific Features

- **Slide-out sidebar** with spring animation and body scroll lock
- **Backdrop overlay** closes sidebar/menu on tap
- **Touch-optimized tap targets** (min 44×44px)
- **Responsive tables** convert to cards on small screens
- **Floating action button** adapts size for thumb reachability
- **No custom cursor** on touch devices (performance optimization)
- **Horizontal scroll prevention** with `overflow-x-hidden`

---

## Performance Considerations

- **Code splitting**: Potential for lazy-loading heavy chart/3D pages
- **Memoization**: `useMemo` for filtered decisions and chart data
- **Touch device detection**: Skips custom cursor RAF loop on mobile
- **Image optimization**: Minimal image usage, CSS-based visuals preferred
- **Bundle size**: ~2MB (includes Three.js + Recharts)

---

## License

Proprietary — DecisionVault

---

*Built by humans. For humans.*
