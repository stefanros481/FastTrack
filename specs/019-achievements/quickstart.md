# Quickstart: Achievements & Badges

**Feature**: 019-achievements | **Date**: 2026-03-06

## Prerequisites

- Node.js 18+, Bun installed
- Local `.env.local` with database credentials
- Prisma client generated (`bunx prisma generate`)

## No Schema Changes

This feature requires **no database migrations**. All badge data is computed from existing `FastingSession` records. Ensure you have the gamification fields from epic 018 (already merged):

```bash
# Verify gamification fields exist
bunx prisma db pull --force  # optional: sync schema from DB
grep gamificationEnabled prisma/schema.prisma
```

## Development Setup

```bash
# Install dependencies (if new packages needed — none expected)
bun install

# Start dev server
bun run dev
```

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/lib/badges.ts` | Badge definitions (constants) + computation logic |
| `src/types/badges.ts` | TypeScript types for badges |
| `src/app/actions/badges.ts` | `getBadges()` server action |
| `src/components/CommunityView.tsx` | Community tab content |
| `src/components/AchievementsGrid.tsx` | Badge grid display |
| `src/components/BadgeCelebration.tsx` | Celebration overlay |

## Key Files to Modify

| File | Change |
|------|--------|
| `src/components/FastingTimer.tsx` | Add "community" view, conditional nav tabs, header gear icon |
| `src/app/page.tsx` | Fetch `getBadges()` and pass to FastingTimer |

## Testing

1. **Badge computation**: Create test sessions covering each badge threshold. Verify `getBadges()` returns correct earned badges.
2. **Navigation**: Toggle gamification on/off in Settings. Verify Community tab appears/disappears.
3. **Celebration**: Clear localStorage (`localStorage.removeItem("fasttrack-celebrations-seen")`), then navigate to Community tab with earned badges. Verify celebration overlay appears.
4. **Empty state**: Test with a user who has zero sessions — all badges locked.
5. **Mobile viewport**: Test on 375px width — grid fits, touch targets meet 44px minimum.

## Architecture Notes

- Follows `getStats()` pattern: single Prisma query → in-memory computation → return derived state
- No new database tables or fields
- No new API routes — server action only
- Celebration state in localStorage — re-triggers on new device (acceptable per spec)
