# Server Action Contracts: Achievements & Badges

**Feature**: 019-achievements | **Date**: 2026-03-06

## getBadges()

**File**: `src/app/actions/badges.ts`
**Pattern**: Same as `getStats()` in `src/app/actions/fasting.ts`

### Signature

```typescript
export async function getBadges(): Promise<ComputedBadgeState | null>
```

### Preconditions

- Authenticated session (via `getUserId()` helper)
- At least one completed session for the user (returns `null` if no sessions)

### Return Type

```typescript
interface ComputedBadgeState {
  earned: EarnedBadge[];
  progress: BadgeProgress[];
}

interface EarnedBadge {
  badgeId: string;       // e.g. "streak-3", "volume-10"
  earnedDate: string;    // ISO date string, approximate
}

interface BadgeProgress {
  category: BadgeCategory;
  nextBadgeId: string | null;  // null if all earned in category
  current: number;
  target: number;
}
```

### Behavior

1. Calls `getUserId()` — throws redirect if unauthenticated
2. Fetches all completed sessions for the user (single Prisma query)
3. Computes all 5 badge categories from session data
4. Returns earned badges + progress toward next badge per category
5. Returns `null` if user has zero completed sessions

### Error Handling

- Unauthenticated: Redirect to sign-in (handled by `getUserId()`)
- No sessions: Returns `null`
- DB error: Throws (caught by Next.js error boundary)

---

## No Mutations

This feature adds no server-side mutations. All badge state is computed, not stored. The only client-side write is to localStorage (celebration-seen tracking), which requires no server action.
