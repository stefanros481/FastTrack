# Product Requirements Document (PRD)
# FastTrack — Fasting Tracker App

**Version:** 2.1
**Date:** February 27, 2026
**Status:** Draft  

---

## 1. Overview

FastTrack is a mobile-first web application that enables a small group of users (up to 5) to track intermittent fasting sessions with ease. Users can start and stop fasts with a single tap, review their fasting history on a dashboard with statistics and charts, set duration goals, add notes, and edit session times when needed. Each user's data and settings are completely private — there is no cross-user visibility. The app is built on Next.js, deployed to Vercel, secured with Auth.js, and backed by Vercel Postgres.

---

## 2. Problem Statement

People practicing intermittent fasting need a simple, reliable way to log when they start and stop eating. Existing solutions are either bloated with unnecessary features, locked behind subscriptions, or lack a premium feel. FastTrack focuses on the core workflow — start, stop, review — and wraps it in a calm, trustworthy interface that makes fasting feel effortless. The app supports a small household or friend group (up to 5 users) while keeping each person's data completely private.

---

## 3. Target User

A small group of up to 5 users (the app owner and their household members or friends) who practice intermittent fasting and want a secure, private, premium-feeling tracker deployed on the owner's Vercel account. The owner manages the allowlist of authorized emails. Each user's fasting data and settings are completely isolated — no user can see another's data.

---

## 4. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Frictionless session tracking | Start/stop a fast in ≤ 2 taps |
| Data reliability | 100% of sessions persisted in Vercel Postgres |
| Secure access | Only authorized users (up to 5) can access the app |
| Edit confidence | User can correct any session time in ≤ 3 taps |
| Delight | Premium feel — no visual clutter, smooth interactions |

---

## 5. Technical Architecture

### 5.1 Stack Overview

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Next.js 14+ (App Router)** | Server components, API routes, server actions |
| Deployment | **Vercel** | Automatic CI/CD from Git |
| Authentication | **Auth.js (NextAuth.js v5)** | OAuth provider(s), JWT sessions |
| Database | **Vercel Postgres** | Managed PostgreSQL, serverless-friendly |
| ORM | **Prisma** | Type-safe queries, migrations, schema management |
| Styling | **Tailwind CSS** | Utility-first, mobile-first responsive |
| Charts | **Recharts** | Composable React chart library |
| Icons | **Lucide React** | Consistent, lightweight icon set |
| Notifications | **Browser Notification API** | With in-app toast fallback |

### 5.2 Authentication Architecture

Auth.js (NextAuth.js v5) handles all authentication concerns.

**Auth flow:**

1. User navigates to the app
2. Middleware checks for a valid session
3. If unauthenticated → redirect to `/auth/signin`
4. User authenticates via OAuth provider (Google recommended as primary)
5. Auth.js creates a JWT session stored as an HTTP-only cookie
6. Subsequent requests are validated via middleware
7. Unauthorized users see nothing — all routes are protected

**Configuration:**

- **Provider:** Google OAuth (primary). GitHub as optional secondary.
- **Session strategy:** JWT (stateless, no session table needed)
- **Authorized users:** Restrict login to up to 5 email addresses via environment variable (`AUTHORIZED_EMAILS`, comma-separated). Any email not in the list is rejected at sign-in. Maximum 5 entries enforced at validation time.
- **Middleware:** `middleware.ts` at project root protects all routes except `/auth/*` and `/api/auth/*`

**Environment variables required:**

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Auth.js encryption secret |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTHORIZED_EMAILS` | Comma-separated list of up to 5 emails allowed to log in (e.g., `alice@example.com,bob@example.com`) |
| `POSTGRES_URL` | Vercel Postgres connection string (auto-provisioned) |
| `POSTGRES_URL_NON_POOLING` | Direct connection for Prisma migrations |

**Security rules:**

- All pages and API routes require authentication (enforced by middleware)
- Sign-in callback rejects any email that is not in the `AUTHORIZED_EMAILS` list
- Maximum 5 authorized emails enforced — additional entries are ignored
- JWT tokens expire after 30 days (configurable)
- CSRF protection is handled automatically by Auth.js
- No public-facing pages exist except the sign-in page
- Each user's data is scoped to their own `userId` — no cross-user data access is possible

### 5.3 Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  FastingSession[]
  settings  UserSettings?
}

model FastingSession {
  id           String    @id @default(cuid())
  startedAt    DateTime
  endedAt      DateTime?
  goalMinutes  Int?
  note         String?   @db.VarChar(280)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt(sort: Desc)])
  @@index([userId, endedAt])
}

model UserSettings {
  id                    String  @id @default(cuid())
  defaultGoalMinutes    Int?
  reminderEnabled       Boolean @default(false)
  reminderTime          String? // HH:mm format
  maxDurationMinutes    Int?
  theme                 String  @default("dark") // "dark" | "light"

  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Key design decisions:**

- `FastingSession.endedAt` is nullable — a null value means the fast is currently active
- Composite index on `(userId, startedAt DESC)` for fast history queries
- `UserSettings` is a 1:1 relation — created on first login for each user
- `onDelete: Cascade` ensures cleanup if user record is removed
- `note` is capped at 280 characters at the database level
- Multi-user support: each user gets their own `User` record, `UserSettings`, and `FastingSession` records — all queries are scoped by `userId`
- Up to 5 users can be authorized via the `AUTHORIZED_EMAILS` env var; each gets a separate `User` row on first sign-in

### 5.4 API Design (Server Actions + API Routes)

Next.js App Router server actions are used for mutations. API routes are used for data fetching where needed.

| Action / Endpoint | Method | Purpose |
|-------------------|--------|---------|
| `startFast()` | Server Action | Create new session with `startedAt = now()` |
| `stopFast(sessionId)` | Server Action | Set `endedAt = now()` on active session |
| `updateSession(sessionId, data)` | Server Action | Edit start/end times, goal, note |
| `deleteSession(sessionId)` | Server Action | Remove a session |
| `updateSettings(data)` | Server Action | Update user preferences |
| `GET /api/sessions` | API Route | Fetch paginated session history |
| `GET /api/stats` | API Route | Fetch computed statistics |

**All actions and routes:**

- Verify the authenticated user's session via `auth()`
- Scope all queries to the authenticated `userId`
- Validate input (Zod schemas)
- Return typed responses

### 5.5 Project Structure

```
fasttrack/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, font loading, providers
│   │   ├── page.tsx                # Home — active fast / start button
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard — stats, charts, history
│   │   ├── settings/
│   │   │   └── page.tsx            # Settings — goal, reminders, theme
│   │   ├── auth/
│   │   │   └── signin/
│   │   │       └── page.tsx        # Custom sign-in page
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       │   └── route.ts        # Auth.js route handler
│   │       ├── sessions/
│   │       │   └── route.ts        # GET paginated sessions
│   │       └── stats/
│   │           └── route.ts        # GET computed stats
│   ├── actions/
│   │   ├── fasting.ts              # Server actions for session CRUD
│   │   └── settings.ts             # Server actions for settings
│   ├── components/
│   │   ├── ActiveFast.tsx          # Timer, progress ring, stop button
│   │   ├── StartTimeAdjuster.tsx   # Bottom sheet with spinning wheel picker for start time
│   │   ├── StartFast.tsx           # Start button, goal picker
│   │   ├── SessionCard.tsx         # History list item
│   │   ├── SessionDetail.tsx       # Edit modal — times, note, goal
│   │   ├── StatsCards.tsx          # Summary stat cards
│   │   ├── DurationChart.tsx       # Duration over time chart
│   │   ├── WeeklyChart.tsx         # Weekly totals chart
│   │   ├── GoalRateChart.tsx       # Goal hit rate donut
│   │   ├── BottomNav.tsx           # Mobile bottom navigation
│   │   ├── ThemeProvider.tsx       # Dark/light mode context
│   │   └── ui/
│   │       ├── wheel-picker.tsx   # Reusable spinning drum picker primitive
│   │       ├── date-time-picker.tsx # Calendar + number input picker
│   │       ├── calendar.tsx       # React Day Picker wrapper
│   │       ├── popover.tsx        # Radix popover wrapper
│   │       └── button.tsx         # Button component
│   ├── lib/
│   │   ├── auth.ts                 # Auth.js configuration
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── validators.ts           # Zod schemas
│   │   └── utils.ts                # Date/time helpers
│   └── middleware.ts               # Auth middleware — protect all routes
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── .env.local                      # Environment variables (not committed)
```

---

## 6. Core Features

### 6.1 Fasting Session Tracking

The primary interaction. A user taps once to begin a fast and once to end it. While a fast is active, a live timer shows elapsed time.

- **Start fasting:** Server action creates a `FastingSession` with `startedAt = now()`
- **Live timer:** Client-side `setInterval` computing elapsed time from `startedAt`
- **Adjust start time:** While a fast is active, user can tap the "Started..." badge to open an iOS-style spinning wheel picker and correct the start time (date + hour + minute). Timer recalculates immediately.
- **Stop fasting:** Server action sets `endedAt = now()` on the active session
- **Active session detection:** Query for session where `endedAt IS NULL` and `userId = currentUser`

**Session data model:** See Prisma schema in Section 5.3.

### 6.2 Session Editing

Users may realize they forgot to start or stop at the right time. They need to correct `startedAt` and/or `endedAt` after the fact.

- **During active fast — spinning wheel picker (drum picker):**
  - Tapping the "Started..." badge opens a bottom sheet with an iOS-style spinning wheel
  - Three wheel columns: Day (last 7 days), Hour (00–23), Minute (00–59)
  - Items snap into place on scroll; selected value highlighted with an indicator band
  - Preview line shows the selected date/time before confirming
  - Validation: start time cannot be in the future; cannot overlap with completed sessions
  - Timer recalculates immediately on confirm
- **After session ends — popover date/time picker:**
  - Inline date/time picker for both start and end (calendar + number inputs)
  - Validation: `startedAt` must be before `endedAt`
  - Validation: sessions cannot overlap with other sessions (server-side check)
  - Visual confirmation of the change before saving
  - Server action validates and persists the update

### 6.3 Optional Notes

Each session can carry a short free-text note (e.g., "felt great", "broke fast early — headache").

- Add note during or after a session
- Edit note from session detail view
- Notes appear in history list as truncated preview
- Max 280 characters (enforced at DB and UI level)

### 6.4 Fasting Goal / Target Duration

Users can set a target duration for individual sessions. Progress toward the goal is shown during an active fast.

- Set goal when starting a fast or edit it during
- Visual progress indicator (circular ring) showing % toward goal
- Celebration animation when goal is reached
- Quick-select options: 16h, 18h, 20h, 24h, or custom
- Default goal configurable in settings (stored in `UserSettings`)
- Goal is optional — users can fast without one

### 6.5 Fasting Dashboard

A comprehensive view of fasting history and insights.

#### 6.5.1 Fasting History List

- Chronological list of all completed sessions (newest first)
- Each entry shows: date, start → end times, duration, goal (if set), note preview, goal met indicator
- Paginated (20 per page) via API route
- Tap entry to expand into session detail / edit modal

#### 6.5.2 Statistics

| Stat | Calculation |
|------|-------------|
| Total fasts | `COUNT(*)` of completed sessions |
| Average duration | `AVG(endedAt - startedAt)` |
| Longest fast | `MAX(endedAt - startedAt)` |
| Current streak | Consecutive days with ≥ 1 completed fast (computed server-side) |
| Best streak | Longest consecutive-day streak ever |
| This week | Count + total hours for current ISO week |
| This month | Count + total hours for current calendar month |

All stats computed via server-side queries scoped to the authenticated user.

#### 6.5.3 Charts & Graphs

- **Duration over time:** Bar chart showing fast durations, filterable by 7 / 30 / 90 days
- **Weekly summary:** Bar chart of total hours fasted per week (last 8–12 weeks)
- **Goal hit rate:** Donut chart — percentage of goal-having sessions that met/exceeded the goal

Charts rendered client-side with Recharts, data fetched via API route.

### 6.6 Notifications & Reminders

- **Goal reached:** Browser notification when active fast hits the target duration
- **Reminder to start:** Optional daily reminder at user-configured time
- **Max duration reminder:** Optional notification after user-configured max duration
- Implementation: Browser Notification API with permission prompt
- Fallback: in-app toast notification if browser permission denied
- Reminder preferences stored in `UserSettings`

---

## 7. Non-Functional Requirements

### 7.1 Platform & Responsiveness

- Mobile-first web app (primary viewport: 375–428px)
- Fully responsive up to desktop (1440px)
- Deployed on Vercel with automatic preview deployments per branch

### 7.2 Security

- Auth.js middleware protects every route
- Authorized email allowlist (up to 5) enforced at sign-in callback via `AUTHORIZED_EMAILS`
- JWT sessions with HTTP-only cookies
- All database queries scoped to authenticated `userId` — strict data isolation between users
- CSRF protection via Auth.js
- Environment secrets stored in Vercel project settings
- No public API endpoints

### 7.3 Performance

- Server components for initial page load (zero client JS for static content)
- Client components only where interactivity is needed (timer, charts, modals)
- Prisma query optimization with proper indexes
- Edge-compatible middleware for fast auth checks
- Target: < 1.5s initial load, 60fps timer updates

### 7.4 Visual Design

| Principle | Implementation |
|-----------|---------------|
| Color palette | Deep navy (#0B1426), off-white (#F7F8FA), muted sage accent (#7C9A8E), warm coral for CTAs (#D4756B) |
| Typography | DM Sans — display: 600/700, body: 400/500 |
| Spacing | 8px base grid, generous padding (16–32px) |
| Corners | 12–16px on cards, 24px on buttons |
| Shadows | Subtle, layered box-shadows |
| Icons | Lucide React — consistent stroke weight |
| Motion | Ease-in-out 200–300ms transitions |
| Theme | Dark mode default, light mode toggle |

---

## 8. Information Architecture

```
FastTrack App
├── /auth/signin        (public — sign-in page)
├── /                   (protected — Home)
│   ├── Timer display
│   ├── Goal progress ring
│   ├── Start / Stop button
│   ├── "Started..." badge → Start time adjuster (spinning wheel bottom sheet)
│   └── Quick note input
├── /dashboard          (protected — Dashboard)
│   ├── Stats summary cards
│   ├── Charts (duration, weekly, goal rate)
│   └── History list
│       └── Session detail / edit modal
└── /settings           (protected — Settings)
    ├── Default fasting goal
    ├── Reminder preferences
    └── Theme toggle (dark/light)
```

---

## 9. User Stories

### Epic 1: Authentication

**US-1.0 — Secure sign-in**
*As an authorized user, I want to sign in with my Google account so that only I and other authorized users can access the app.*

- **Acceptance criteria:**
  - Navigating to any page while unauthenticated redirects to `/auth/signin`
  - Sign-in page shows a "Sign in with Google" button styled to match the premium aesthetic
  - Only emails listed in the `AUTHORIZED_EMAILS` env var (up to 5, comma-separated) are allowed to sign in
  - Any other email sees an error: "This app is private. Access denied."
  - After successful sign-in, user is redirected to the home page
  - A `User` record is created in the database on first sign-in (upsert)
  - `UserSettings` record is created with defaults on first sign-in
  - Each authorized user gets their own isolated data space — no cross-user visibility

**US-1.1 — Sign out**  
*As a user, I want to sign out so that my session is terminated.*

- **Acceptance criteria:**
  - Sign-out option available in settings
  - Clicking sign out clears the session cookie and redirects to `/auth/signin`

**US-1.2 — Session persistence**  
*As a user, I want to stay signed in across browser sessions so that I don't have to log in every time.*

- **Acceptance criteria:**
  - JWT session lasts 30 days
  - Closing and reopening the browser preserves the session
  - Session is refreshed on each visit (sliding window)

### Epic 2: Fasting Session Lifecycle

**US-2.1 — Start a fast**  
*As a user, I want to start a fasting session with a single tap so that the app immediately begins tracking my fast.*

- **Acceptance criteria:**
  - A prominent "Start Fast" button is visible on the home screen when no fast is active
  - Tapping the button calls a server action that creates a `FastingSession` with `startedAt = now()`
  - A live timer begins counting up immediately on the client
  - The UI transitions to "active fast" state with a smooth animation
  - If a default goal is set in settings, it auto-populates on the new session

**US-2.2 — View active fast timer**  
*As a user, I want to see a live timer showing how long my current fast has been running so that I know my progress at a glance.*

- **Acceptance criteria:**
  - Timer displays hours, minutes, and seconds (HH:MM:SS)
  - Timer updates every second via client-side `setInterval`
  - Timer is the dominant visual element on the home screen during an active fast
  - Timer survives page refreshes (reads `startedAt` from server)

**US-2.3 — Stop a fast**  
*As a user, I want to stop my active fast with a single tap so that the session is completed and saved.*

- **Acceptance criteria:**
  - A "Stop Fast" button replaces the start button during an active fast
  - Tapping calls a server action that sets `endedAt = now()`
  - A brief summary of the completed session is shown (duration, goal met/missed)
  - The UI transitions back to the "ready to fast" state

**US-2.4 — Resume app with active fast**
*As a user, I want my active fast to survive closing and reopening the browser so that I don't lose my progress.*

- **Acceptance criteria:**
  - On app load, the server checks for a session where `endedAt IS NULL`
  - If found, the home page renders the active timer computed from `startedAt`
  - Timer shows the correct elapsed time (not reset to 0)

**US-2.5 — Adjust start time during active fast**
*As a user, I want to adjust the start time of my active fast using a spinning wheel so that I can correct it if I forgot to tap "Start" on time.*

- **Acceptance criteria:**
  - The "Started..." badge on the active fast screen is tappable
  - Tapping opens a bottom sheet with an iOS-style spinning wheel (drum picker)
  - Three wheel columns: Day (last 7 days including "Today", "Yesterday"), Hour (00–23), Minute (00–59)
  - Wheels default to the current start time values
  - Items snap to position on scroll; selected item highlighted with a visual indicator band
  - Fade overlays at the top and bottom of each wheel for depth effect
  - A preview line below the wheels shows the full selected date/time (e.g., "Thursday, Feb 27 · 10:30")
  - If the selected time is in the future, an inline error is shown and confirm is disabled
  - Confirm button calls a server action that validates and updates `startedAt`
  - Server validates: session belongs to user, session is active, no overlap with completed sessions, not in future
  - On success, the timer recalculates immediately from the new `startedAt` — no page reload needed
  - Close via X button or tapping the backdrop

### Epic 3: Session Editing

**US-3.1 — Edit start time**  
*As a user, I want to edit the start time of a session so that I can correct it if I forgot to tap "Start" on time.*

- **Acceptance criteria:**
  - From session detail modal, I can tap the start time to open a date/time picker
  - The picker defaults to the current `startedAt` value
  - Server action validates and updates the session, recalculates duration
  - Validation prevents `startedAt` >= `endedAt`
  - Validation prevents overlap with adjacent sessions

**US-3.2 — Edit end time**  
*As a user, I want to edit the end time of a session so that I can correct it if I forgot to tap "Stop" on time.*

- **Acceptance criteria:**
  - From session detail modal, I can tap the end time to open a date/time picker
  - The picker defaults to the current `endedAt` value
  - Validation prevents `endedAt` <= `startedAt`
  - Validation prevents overlap with adjacent sessions

**US-3.3 — Validation feedback on edit**  
*As a user, I want to see clear feedback if my edited times are invalid so that I don't save bad data.*

- **Acceptance criteria:**
  - If `startedAt` >= `endedAt`, show inline error: "Start time must be before end time"
  - If the session overlaps another session, show inline error: "This overlaps with another session"
  - Save button is disabled while errors are present
  - Validation runs both client-side (immediate feedback) and server-side (security)

### Epic 4: Notes

**US-4.1 — Add a note to a session**  
*As a user, I want to add an optional note to a fasting session so that I can record how I felt or why I broke the fast.*

- **Acceptance criteria:**
  - A text input is available on the active fast screen and on the session detail modal
  - Notes are free-text, max 280 characters
  - Character counter visible when typing
  - Notes are saved via server action

**US-4.2 — Edit a note**  
*As a user, I want to edit or delete a note after the session is completed.*

- **Acceptance criteria:**
  - From session detail, I can tap the note to edit it
  - I can clear the note entirely
  - Changes persist via server action

### Epic 5: Fasting Goal

**US-5.1 — Set a fasting goal**  
*As a user, I want to set a target duration for my fast so that I have a goal to work toward.*

- **Acceptance criteria:**
  - When starting a fast, I can optionally set a goal
  - Quick-select options: 16h, 18h, 20h, 24h
  - Custom input for any duration
  - Goal stored as `goalMinutes` on the session record
  - If a default goal exists in settings, it pre-fills

**US-5.2 — View goal progress**  
*As a user, I want to see my progress toward my fasting goal as a visual indicator so that I stay motivated.*

- **Acceptance criteria:**
  - A circular progress ring shows percentage toward the goal
  - Remaining time displayed (e.g., "4h 23m to go")
  - Ring fills as time progresses
  - When goal is reached, ring completes with a subtle celebration animation

**US-5.3 — Goal reached notification**  
*As a user, I want to be notified when I reach my fasting goal so that I know I can break my fast.*

- **Acceptance criteria:**
  - Browser notification fires when elapsed time >= goal duration
  - In-app toast notification as fallback
  - Notification text: "You've reached your [X]h fasting goal!"

**US-5.4 — Default goal in settings**  
*As a user, I want to set a default fasting goal so that I don't have to pick one every time.*

- **Acceptance criteria:**
  - Settings page has a "Default goal" option
  - New sessions auto-fill with the default goal
  - Can be overridden per session
  - Stored in `UserSettings.defaultGoalMinutes`

### Epic 6: Dashboard — History

**US-6.1 — View fasting history**  
*As a user, I want to see a list of all my past fasting sessions so that I can review my habits.*

- **Acceptance criteria:**
  - Chronological list, newest first
  - Each entry shows: date, start → end times, duration, goal (if set), note preview, goal met indicator
  - Paginated (20 per page) via API route with cursor-based pagination
  - Tap entry to open session detail modal

**US-6.2 — Delete a session**  
*As a user, I want to delete a fasting session that was logged by mistake.*

- **Acceptance criteria:**
  - Delete button in session detail modal
  - Confirmation prompt: "Delete this session? This cannot be undone."
  - Server action deletes the record and revalidates the dashboard data
  - All stats and charts update to reflect the deletion

### Epic 7: Dashboard — Statistics

**US-7.1 — View summary statistics**  
*As a user, I want to see key fasting statistics so that I can understand my overall behavior.*

- **Acceptance criteria:**
  - Dashboard shows stat cards: total fasts, average duration, longest fast, current streak, best streak
  - "This week" and "This month" summaries
  - Stats computed server-side via Prisma aggregate queries
  - Stats refresh when navigating to the dashboard

### Epic 8: Dashboard — Charts

**US-8.1 — View duration chart**  
*As a user, I want to see a chart of my fasting durations over time so that I can spot trends.*

- **Acceptance criteria:**
  - Bar chart showing each session's duration
  - Time range selector: 7 days, 30 days, 90 days
  - Goal line overlay if a default goal is set
  - Rendered client-side with Recharts

**US-8.2 — View weekly totals chart**  
*As a user, I want to see how many hours I fasted each week so that I can track consistency.*

- **Acceptance criteria:**
  - Bar chart with one bar per week
  - Y-axis: total hours fasted
  - Shows the last 8–12 weeks

**US-8.3 — View goal hit rate**  
*As a user, I want to see what percentage of my fasts hit the goal so that I know how disciplined I've been.*

- **Acceptance criteria:**
  - Donut chart showing hit rate percentage
  - Denominator = sessions with a goal set
  - Numerator = sessions where duration >= goal

### Epic 9: Notifications & Reminders

**US-9.1 — Daily reminder to start fasting**  
*As a user, I want to receive a daily reminder to start my fast so that I stay consistent.*

- **Acceptance criteria:**
  - Settings toggle to enable/disable
  - Configurable time (HH:mm)
  - Browser Notification API with permission prompt on first enable
  - In-app toast fallback if permission denied
  - Preference stored in `UserSettings`

**US-9.2 — Max duration reminder**  
*As a user, I want a reminder if I've been fasting beyond a certain duration so that I don't overdo it.*

- **Acceptance criteria:**
  - Settings option with configurable max duration
  - Notification fires when active fast exceeds the max
  - Only fires once per session
  - Stored in `UserSettings.maxDurationMinutes`

### Epic 10: Settings

**US-10.1 — Theme toggle**  
*As a user, I want to switch between dark and light mode.*

- **Acceptance criteria:**
  - Toggle in settings
  - Preference persisted in `UserSettings.theme`
  - Default: dark mode
  - Theme applied via CSS variables and Tailwind dark mode

**US-10.2 — Settings persistence**  
*As a user, I want my settings saved server-side so that they persist across devices and sessions.*

- **Acceptance criteria:**
  - All settings stored in `UserSettings` table via server actions
  - Loaded on app initialization as part of the layout server component

---

## 10. Deployment & DevOps

### 10.1 Vercel Configuration

| Concern | Approach |
|---------|---------|
| Hosting | Vercel (auto-detected Next.js) |
| Database | Vercel Postgres (provisioned via Vercel dashboard) |
| Environment | Secrets configured in Vercel project settings |
| Preview deployments | Automatic per pull request |
| Production branch | `main` |

### 10.2 Database Migrations

- Prisma Migrate for schema changes
- `npx prisma migrate dev` locally
- `npx prisma migrate deploy` in Vercel build step (via `postinstall` or build script)
- Migration files committed to Git

### 10.3 Development Workflow

```bash
# Initial setup
npx create-next-app@latest fasttrack --typescript --tailwind --app
cd fasttrack
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter
npm install recharts lucide-react zod
npx prisma init

# Development
npx prisma migrate dev
npm run dev

# Deploy
git push origin main  # Vercel auto-deploys
```

---

## 11. Out of Scope (v1.0)

- Open user registration (users are added only via owner-managed `AUTHORIZED_EMAILS` allowlist, max 5)
- Cloud sync across devices (already handled — it's a server-rendered app)
- Social features / cross-user visibility (each user's data is fully private)
- Health app integrations (Apple Health, Google Fit)
- Export to CSV/JSON (considered for v1.1)
- PWA install prompt (considered for v1.1)
- Multiple simultaneous fasts
- Admin dashboard for user management (users are managed via env var)

---

## 12. Release Plan

| Phase | Scope | Target |
|-------|-------|--------|
| v1.0 MVP | Auth (up to 5 users), session tracking, editing, notes, goals, dashboard (history + stats + charts), notifications, dark/light theme | First deploy |
| v1.1 | PWA support, CSV/JSON export, onboarding flow | Follow-up |
| v1.2 | Fasting protocol templates, streaks gamification | Future |

---

## Appendix A: Screen Map

1. **`/auth/signin`** — "Sign in with Google" button, premium branding, error messaging for unauthorized emails
2. **`/` (Home — Idle)** — Large "Start Fast" button (center), last fast summary, goal picker, bottom nav
3. **`/` (Home — Active)** — Live timer (dominant), progress ring, goal info, note input, tappable "Started..." badge → spinning wheel start time adjuster, "End Fast" button
4. **`/dashboard`** — Stat cards at top, chart tabs below, scrollable history list at bottom
5. **Session Detail Modal** — Full session info, editable start/end pickers, note editor, goal editor, delete button
6. **`/settings`** — Default goal, reminder config, max duration, theme toggle, sign out button
