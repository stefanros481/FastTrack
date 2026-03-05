# Gamification & Safety Features for FastTrack

## Context

FastTrack supports authorized users but has zero social or competitive features — each user operates in complete isolation. Adding gamification creates friendly competition and accountability between participants (family/friends), increasing motivation and engagement.

**Safety concern:** The app currently has no health disclaimers, fasting safety guidance, or upper-limit warnings. Since gamification encourages more/longer fasting, we must add safety guardrails first to prevent users from overdoing it. Extended fasting (24h+) carries real health risks — electrolyte imbalance, hypoglycemia, muscle wasting — and the app should actively discourage dangerous behavior.

## Scope

Five features, implemented as separate epics in priority order:

0. **Health & Safety Guardrails** — Disclaimers, duration warnings, safe fasting guidance *(must ship before gamification)*
1. **Achievements/Badges** — Personal milestone badges
2. **Who's Fasting Now** — Live status of other users on the timer
3. **Group Leaderboard** — Cross-user ranked stats
4. **Weekly Group Challenge** — Auto-rotating weekly competitions

## Epic 0: Health & Safety Guardrails

**Branch**: `017-health-safety`

**Priority**: Must ship before any gamification feature. Gamification encourages competitive fasting behavior — safety rails must be in place first.

### What Currently Exists

- `maxDurationMinutes` in UserSettings — a notification alert threshold (1–72h range), but purely optional and just triggers a notification, never blocks or warns
- `MIN_FAST_SECONDS` (8h) — minimum duration for a completed session
- **No maximum fast duration enforcement**
- **No health disclaimer anywhere in the app**
- **No onboarding or first-use guidance**

### Features

#### A. Health Disclaimer Banner
- Persistent dismissible banner on first use (tracked via `localStorage` key `fasttrack-disclaimer-seen`)
- Text: "FastTrack is a tracking tool, not medical advice. Consult a healthcare professional before starting any fasting regimen. Extended fasting can be dangerous — listen to your body and stop if you feel unwell."
- Appears at top of Timer view until dismissed
- Also shown as a static section on the Settings page (always visible, not dismissible)

#### B. Active Fast Duration Warnings
Escalating visual warnings on the timer based on elapsed time:

| Threshold | Severity | Visual |
|-----------|----------|--------|
| 24 hours | Caution | Timer text turns `--color-warning` (yellow), subtle warning icon appears |
| 36 hours | Warning | Timer area gets warning background tint, "Consider ending your fast" message |
| 48 hours | Danger | Timer turns `--color-error` (red), prominent "Extended fasting can be dangerous" alert |

These are visual warnings only — they don't block the user, but make the risk impossible to ignore.

#### C. Gamification Safety Cap
- Achievement badges cap at 24h for duration milestones (no badges for 36h+ or 48h+ fasts)
- Leaderboard "Longest Fast" category shows a note: "Longer isn't always better — consult a doctor for fasts over 24h"
- Weekly challenge "Most Hours" caps individual contribution at 20h/day to discourage skipping meals entirely

#### D. Safe Fasting Tips
- New section in Settings: "Fasting Safety" with collapsible tips
- Topics: hydration, electrolytes, when to break a fast, signs to stop, who should not fast (pregnant, diabetic, underweight, under 18, eating disorders)
- Links to reputable sources (optional, can be static text)

### Files

| File | Action | Purpose |
|------|--------|---------|
| `src/components/HealthDisclaimer.tsx` | NEW | Dismissible first-use banner with disclaimer text |
| `src/components/FastDurationWarning.tsx` | NEW | Escalating timer warnings at 24h/36h/48h |
| `src/components/SafeFastingTips.tsx` | NEW | Collapsible safety tips section |
| `src/components/FastingTimer.tsx` | MODIFY | Show HealthDisclaimer at top, integrate FastDurationWarning into timer display |
| `src/app/settings/page.tsx` | MODIFY | Add disclaimer + SafeFastingTips section |
| `src/app/globals.css` | MODIFY | Add `animate-pulse-warning` keyframe for danger state |

### Key Design

- Warnings are purely visual/informational — no blocking or auto-stopping fasts
- Disclaimer uses `localStorage` (not DB) to track dismissal — simple, no migration
- Warning thresholds are constants in `src/lib/validators.ts` (alongside existing MIN_FAST constants)
- `FastDurationWarning` receives elapsed seconds as a prop and renders the appropriate severity level
- All warning text uses `--color-warning` and `--color-error` design tokens for consistency

---

## Architecture Decisions

- **No schema changes.** All gamification data is derived from existing `FastingSession`, `User`, and `UserSettings` tables. Badges are computed on-the-fly from session history.
- **New "Community" tab** in bottom nav (replaces Settings link). Settings moves to a gear icon in the header alongside the existing ThemeToggle and ConnectionStatus.
- **Cross-user API routes** under `/api/community/*`. These require auth but don't scope to a single user. Follow the existing pattern in `src/app/api/sessions/route.ts`.
- **Custom hooks** for client-side data fetching, following the `useChartData` pattern in `src/hooks/useChartData.ts`.
- **Server action** for achievements only (personal, computed per-user like `getStats()`).

## Navigation Change

```
Current:  Timer | Insights | Log | Settings (link)
New:      Timer | Insights | Community | Log
```

- Add `"community"` to the `view` union type in `FastingTimer.tsx`
- Settings link moves to header (gear icon next to ThemeToggle)
- Community view lazy-loaded like HistoryList

## Epic 1: Achievements/Badges

**Branch**: `017-achievements`

Personal badges unlocking at thresholds. Computed server-side from session data.

### Badge Categories

| Category | Thresholds |
|----------|-----------|
| Streak | 3, 7, 14, 30, 60, 100 days |
| Volume | 10, 50, 100, 250, 500 total fasts |
| Duration | First 18h fast, first 24h fast, 100 total hours |
| Consistency | Perfect Week (7/7), Perfect Month |
| Goals | 10, 50, 100 goals met |

### Files

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/achievements.ts` | NEW | Badge definitions + pure computation functions |
| `src/app/actions/achievements.ts` | NEW | Server action `getAchievements()` — fetches sessions, computes badges |
| `src/components/AchievementBadge.tsx` | NEW | Single badge card (icon + label + locked/unlocked) |
| `src/components/AchievementGrid.tsx` | NEW | Grid of all badges with earned/locked state |
| `src/components/AchievementCelebration.tsx` | NEW | Celebration overlay for newly unlocked badges |
| `src/app/page.tsx` | MODIFY | Call `getAchievements()`, pass to FastingTimer |
| `src/components/FastingTimer.tsx` | MODIFY | Show AchievementGrid in community view |
| `src/app/globals.css` | MODIFY | Add `badge-unlock` keyframe animation |

### Key Design

- `getAchievements()` reuses the same session query as `getStats()` (in `src/app/actions/fasting.ts`)
- Badge unlock celebration: compare earned badges vs `localStorage` key `fasttrack-seen-badges`. New badges trigger animation. Update localStorage after display.
- "Perfect Week/Month": group sessions by ISO week / calendar month, check every day has ≥1 completed session

## Epic 2: Who's Fasting Now

**Branch**: `018-whos-fasting`

Show avatars of other users who are currently fasting. Displayed on the timer view.

### Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/community/active/route.ts` | NEW | Query active sessions across all users (endedAt IS NULL), exclude requesting user |
| `src/hooks/useCommunityActive.ts` | NEW | Polling hook (30s interval), stops when not on timer view |
| `src/components/WhosFastingNow.tsx` | NEW | Horizontal row of 32px circular avatars with name labels |
| `src/components/FastingTimer.tsx` | MODIFY | Show WhosFastingNow below timer when user is fasting |

### Key Design

- API returns `{ users: [{ id, name, image, startedAt }] }` excluding the requesting user
- Poll every 30 seconds — trivial query for a small user group
- Show on timer view only (not community tab) for immediate social context
- Green ring around avatar if someone started within the last hour

## Epic 3: Group Leaderboard

**Branch**: `019-leaderboard`

Ranked view of all users across multiple stat categories. Lives in the new Community tab.

### Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/community/leaderboard/route.ts` | NEW | Cross-user stats: streak, weekly hours, monthly fasts, longest fast, goal rate |
| `src/hooks/useCommunityLeaderboard.ts` | NEW | Fetch hook (on mount, no polling) |
| `src/components/LeaderboardCard.tsx` | NEW | Single category with ranked users |
| `src/components/Leaderboard.tsx` | NEW | Container rendering all category cards |
| `src/components/CommunityView.tsx` | NEW | Community tab layout: WhosFasting + Challenge + Leaderboard + Badges |
| `src/components/FastingTimer.tsx` | MODIFY | Add Community tab to bottom nav, wire CommunityView |
| `src/lib/stats.ts` | NEW | Extract streak computation from `fasting.ts` into reusable utility |

### Leaderboard Categories

| Category | Metric | Display |
|----------|--------|---------|
| Current Streak | Consecutive days | "7 days" |
| Weekly Hours | Total fasting hours this ISO week | "23.5h" |
| Monthly Fasts | Completed fasts this month | "12 fasts" |
| Longest Fast | All-time longest single fast | "24.2h" |
| Goal Rate | % of goals met (min 5 sessions) | "87%" |

### Key Design

- Crown icon (`Crown` from Lucide, `text-yellow-500`) on #1 in each category
- Single API call fetches all sessions for all users, computes everything in memory (trivial at small scale)
- Extract `computeStreak(dates: Date[])` from `fasting.ts` into `src/lib/stats.ts` for reuse

## Epic 4: Weekly Group Challenge

**Branch**: `020-weekly-challenge`

Auto-rotating weekly competitions. No opt-in, all users participate.

### Files

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/challenges.ts` | NEW | Challenge type rotation (deterministic from ISO week number) |
| `src/app/api/community/challenge/route.ts` | NEW | Current challenge standings + previous week winner |
| `src/hooks/useCommunityChallenge.ts` | NEW | Fetch hook |
| `src/components/WeeklyChallenge.tsx` | NEW | Challenge card: title, countdown, ranked standings, previous winner |
| `src/components/CommunityView.tsx` | MODIFY | Add WeeklyChallenge card above Leaderboard |

### Challenge Rotation

```
Week % 3 === 0 → "Most Hours" (total fasting hours Mon-Sun)
Week % 3 === 1 → "Longest Streak" (consecutive days within the week)
Week % 3 === 2 → "Best Goal Rate" (% of goals met)
```

Deterministic from `getISOWeek(now)` — no stored state needed.

### Key Design

- Shows "Ends in X days" countdown
- Progress bars per user showing relative standings
- Previous week's winner with trophy icon
- Challenge card is the hero element at top of Community view

## Prerequisite: Remove 5-User Limit

**Branch**: include in `017-health-safety` (same branch as Epic 0 — small change, no separate branch needed)

The app artificially caps authorized users at 5 via `MAX_AUTHORIZED_EMAILS = 5` in `src/lib/authorized-emails.ts`. This limit has no technical basis — Vercel Postgres and the auth system handle any number of users.

### Change

| File | Action | Detail |
|------|--------|--------|
| `src/lib/authorized-emails.ts` | MODIFY | Remove `MAX_AUTHORIZED_EMAILS` constant and `.slice(0, MAX_AUTHORIZED_EMAILS)` call. All emails in `AUTHORIZED_EMAILS` env var are accepted. |
| `CLAUDE.md` | MODIFY | Update "Up to 5 authorized users" references to "Authorized users: `AUTHORIZED_EMAILS` env var (comma-separated)" |

No schema changes, no migration, no API changes. Just remove the artificial cap.

## Implementation Order

```
Prerequisite (Remove 5-user limit) → tiny change, bundled with Epic 0
Epic 0 (Health Safety)  → MUST ship first — safety before gamification
Epic 1 (Achievements)   → standalone, no cross-user queries
Epic 2 (Who's Fasting)  → first cross-user API
Epic 3 (Leaderboard)    → adds Community tab + nav refactor
Epic 4 (Challenge)      → builds on Community tab from Epic 3
```

Epic 0 is a hard prerequisite for Epics 1–4. Gamification features that encourage longer/more frequent fasting must not ship without safety guardrails. Epic 3 includes the nav refactor (adding Community tab). Epics 1 and 2 can be done before the nav change.

## Verification

**Epic 0 (Health Safety):**
1. First visit: disclaimer banner appears at top of Timer view
2. Dismiss banner → reload → banner stays hidden (localStorage)
3. Settings page shows permanent disclaimer + safety tips section
4. Start a fast, wait or mock elapsed time: 24h → yellow warning, 36h → warning message, 48h → red danger alert
5. Dark mode: warning/danger colors render correctly

**Epics 1–4 (Gamification):**
1. `npx next build` passes with no TypeScript errors
2. Manual testing on localhost:3000 at 375px viewport
3. Dark mode + light mode visual check
4. Auth check: API routes return 401 for unauthenticated requests
5. Cross-user data: verify leaderboard/challenge show all authorized users
6. Badge celebration: clear localStorage, reload, verify animation triggers for earned badges
7. Verify gamification safety caps: no 36h+ badges, leaderboard longest-fast disclaimer, challenge hourly cap
