# Research: Achievements & Badges

**Feature**: 019-achievements | **Date**: 2026-03-06

## Research Topics

### 1. Streak Calculation & Timezone Handling

**Decision**: Use server-local `startOfDay()` (UTC on Vercel) — same as existing `getStats()` implementation.

**Rationale**: The existing streak computation in `src/app/actions/fasting.ts:322-345` already uses `startOfDay(s.endedAt!)` without timezone adjustment. Changing this for badges alone would create inconsistency between the stats page streak and badge streak. The spec mentions "user's local calendar day" but the existing app has no timezone field on the user or session model, and adding one is out of scope.

**Alternatives considered**:
- Pass client timezone via header/param: Adds complexity, requires schema change for consistency. Rejected — out of scope for this epic.
- Store timezone in UserSettings: Requires migration + UI. Deferred to a future epic if needed.

**Impact**: For users near midnight UTC, a fast ending at 11:55 PM local time might count as the next UTC day. Acceptable for 5 personal users on a single timezone.

### 2. Badge Computation Approach

**Decision**: Fetch all completed sessions in a single query, compute all badge categories in-memory in one pass.

**Rationale**: The existing `getStats()` pattern fetches all sessions and computes in-memory. With max ~1000 sessions per user, this is well under 1ms of CPU time. A single DB query is simpler and more maintainable than multiple aggregate queries.

**Alternatives considered**:
- SQL aggregates per badge category: More queries, more complex, marginal performance benefit at this scale. Rejected.
- Cached/stored badge state: Violates FR-001 (compute from session data, don't store). Rejected.
- Hybrid (precompute on session save): Adds write-path complexity for negligible read benefit. Rejected.

### 3. Navigation Architecture — Community as View vs Page

**Decision**: Add "community" to the existing view union type in FastingTimer (`"timer" | "dashboard" | "history" | "community"`), matching the pattern used by Timer, Insights, and Log.

**Rationale**: The existing navigation pattern uses in-component view switching for the first 3 tabs. Making Community a separate Next.js route would break this pattern and require a different data-fetching approach. Keeping it as a view maintains consistency and allows the badges server action data to be fetched alongside other data.

**Alternatives considered**:
- Separate `/community` page route: Would require page navigation instead of view toggle. Inconsistent with existing tabs. Rejected.
- Hybrid (route-based with shared layout): Over-engineered for this use case. Rejected.

### 4. Gamification Flag Propagation

**Decision**: Pass `gamificationEnabled` as a prop from the server component (`src/app/page.tsx`) to `FastingTimer`, which already receives server-fetched data.

**Rationale**: The page.tsx server component already fetches user settings. Adding `gamificationEnabled` to the existing data fetch is trivial. FastingTimer already receives props like `activeFast`, `stats`, etc.

**Alternatives considered**:
- React Context for gamification state: Unnecessary indirection for a single boolean. Rejected.
- Client-side fetch: Violates Constitution Principle III (Server-First Architecture). Rejected.

### 5. Celebration localStorage Schema

**Decision**: Single localStorage key `fasttrack:celebrations-seen` storing a JSON object mapping badge IDs to timestamps.

**Rationale**: O(1) lookup for "has this celebration been seen?" via `if (!(badgeId in seenMap))`. Timestamps cost nothing extra and enable future "earned on" display or debugging. Follows existing single-key pattern (e.g., `localStorage.setItem("theme", ...)` in ThemeProvider).

**Schema**:
```json
// key: "fasttrack:celebrations-seen"
// value: JSON string
{ "streak-3": 1709712000000, "streak-7": 1709712000000, "volume-10": 1709712000000 }
```

**Alternatives considered**:
- JSON array of badge IDs: O(n) lookup, no timestamps. Functional but less useful. Rejected in favor of object.
- Individual keys per badge: Clutters localStorage, harder to enumerate. Rejected.
- Namespaced per user: Not needed — app is single-user-per-device in practice. If a second user logs in on same device, seeing celebrations again is acceptable per spec assumptions.

### 6. Sequential Celebration UX

**Decision**: User taps to dismiss each celebration. No auto-advance timer. Show queue indicator ("1 of 3") when multiple badges earned.

**Rationale**: Auto-advance risks the user missing a badge if they're not looking. Tap-to-dismiss gives the user control and is the standard mobile pattern for achievement popups (gaming apps). Each celebration is a full-screen overlay with the badge icon, name, and a button. Queue indicator sets expectations and gives a sense of progress.

**Button labels**: "Next" when more badges remain, "Done" on the last badge. Do NOT allow backdrop-tap to dismiss (prevents accidental skips).

**Alternatives considered**:
- Auto-advance with 3s timer: User might miss badges. Rejected.
- Carousel/swipe: More complex UI, counterintuitive on centered modal. Rejected.
- Single summary of all new badges: Less impactful — each badge deserves its own moment. Rejected.

### 7. Badge Icon Approach

**Decision**: Use Lucide React icons mapped to each badge category, with color differentiation for earned vs locked state.

**Rationale**: Project constitution locks icon library to Lucide React (Principle V — don't mix icon libraries). Lucide has relevant icons: `Flame` (streak), `Hash` (volume), `Clock` (duration), `CalendarCheck` (consistency), `Target` (goals), `Trophy` (general achievement).

**Icon mapping by category**:
| Category | Lucide Icon | Color (earned) |
|----------|-------------|----------------|
| Streak | `Flame` | `--color-warning` (amber) |
| Volume | `Hash` | `--color-primary` (indigo) |
| Duration | `Clock` | `--color-success` (green) |
| Consistency | `CalendarCheck` | `--color-primary` (indigo) |
| Goals | `Target` | `--color-success` (green) |

Locked badges: `--color-text-muted` with reduced opacity.

### 8. Header Gear Icon Placement

**Decision**: Add Settings gear icon to the right side of the header, before ThemeToggle. Only shown when gamification is enabled (since Settings tab is removed).

**Rationale**: The header currently has: Logo (left) | ConnectionStatus + ThemeToggle (right). Adding a gear icon before the ThemeToggle keeps the header clean and maintains the existing layout pattern. When gamification is disabled, Settings stays in the bottom nav — no header change needed.

### 9. Perfect Week / Perfect Month Calculation

**Decision**: Use date-fns `eachDayOfInterval` with `startOfISOWeek`/`endOfISOWeek` and `startOfMonth`/`endOfMonth` to check if every day in the interval has at least one completed session.

**Rationale**: This matches the spec's definition: ISO week (Monday-Sunday) and calendar month. Check all historical weeks/months, not just the current one.

**Approach**:
1. Build a `Set<string>` of unique session dates (ISO date strings from `startOfDay(endedAt)`)
2. For each ISO week in the session history, check if all 7 days (Mon-Sun) are in the Set
3. For each calendar month, check if all days of that month are in the Set
4. For in-progress periods (current week/month): cap the end date at today — you can't fail a day that hasn't happened yet
5. Count of perfect weeks → check against thresholds (1 = badge)
6. Count of perfect months → check against thresholds (1 = badge)
7. Use date-fns: `eachDayOfInterval`, `startOfISOWeek`, `endOfISOWeek`, `startOfMonth`, `endOfMonth`, `min`

### 10. Duration Badge Cap (FR-008)

**Decision**: Cap duration-based badge thresholds at 24 hours. Fasts longer than 24h still count for the 24h badge but no badge exists for 36h+ or 48h+.

**Rationale**: Per FR-008 and the health & safety guardrails established in epic 017. The badge definitions in the spec already reflect this: "first 18h fast, first 24h fast, 100 total hours" — no thresholds beyond 24h for single-session duration.

**Implementation**: The `100 total hours` badge is cumulative across all sessions, not a single-session duration, so it's unaffected by the cap.
