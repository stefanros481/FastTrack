# Quickstart: Dashboard Statistics

**Feature**: 007-dashboard-statistics
**Branch**: `007-dashboard-statistics`

## Prerequisites

- Node.js 18+
- Bun package manager
- PostgreSQL database (Vercel Postgres or local)
- `.env.local` with `fast_track_DATABASE_URL_UNPOOLED` and auth credentials

## Setup

```bash
git checkout 007-dashboard-statistics
bun install
bunx prisma generate
bunx prisma migrate dev   # no new migrations for this feature
bun dev
```

## No Schema Changes

This feature adds no database migrations. It reads from the existing `FastingSession` table using derived calculations.

## Key Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/actions/fasting.ts` | MODIFY | Extend `getStats()` with streak + period calculations |
| `src/app/page.tsx` | MODIFY | Pass extended stats to FastingTimer |
| `src/components/FastingTimer.tsx` | MODIFY | Replace inline dashboard view with StatsCards |

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/components/StatsCards.tsx` | Stat card grid component (7 cards) |
| `src/components/StatsCardSkeleton.tsx` | Skeleton loading for stat cards |
| `src/lib/format.ts` | Duration formatting utility (`formatDuration`) |

## Verification

1. Open the app → navigate to dashboard view
2. With no completed fasts: see zero/empty state cards
3. Complete a few fasts, return to dashboard: see stats populated
4. Verify streak counts by completing fasts on consecutive days
5. Check "This Week" / "This Month" values against manual count
6. Verify skeleton briefly appears on navigation (throttle network to observe)
7. Verify all cards visible on 375px viewport without horizontal scroll

## Dependencies

No new dependencies required. Uses existing:
- `date-fns` (4.x) — for `startOfISOWeek`, `startOfMonth`, `startOfDay`, `differenceInCalendarDays`
- `lucide-react` — for stat card icons
- `prisma` — for database queries
