# Contract: Stats Interface

**Feature**: 007-dashboard-statistics
**Type**: Internal server action → client component prop interface

## Server Action Contract

### `getStats(): Promise<FastingStats | null>`

**Location**: `src/app/actions/fasting.ts`
**Caller**: `src/app/page.tsx` (server component)
**Auth**: Requires authenticated session via `getUserId()`

**Return type**:

```typescript
interface PeriodSummary {
  count: number;       // Number of completed fasts
  totalHours: number;  // Total hours fasted (decimal, e.g., 48.5)
}

interface FastingStats {
  totalFasts: number;        // >= 0
  totalHours: number;        // >= 0
  avgHours: number;          // >= 0
  longestFast: number;       // >= 0 (hours, decimal)
  goalsMet: number;          // >= 0
  currentStreak: number;     // >= 0 (days)
  bestStreak: number;        // >= 0 (days)
  thisWeek: PeriodSummary;
  thisMonth: PeriodSummary;
}
```

**Returns `null`** when the user has zero completed sessions.

**Invariants**:
- `bestStreak >= currentStreak`
- `thisWeek.count <= totalFasts`
- `thisMonth.count <= totalFasts`
- `longestFast >= avgHours` (when totalFasts > 0)

## Component Props Contract

### `StatsCards`

```typescript
interface StatsCardsProps {
  stats: FastingStats | null;
}
```

**Behavior**:
- `stats === null` → render skeleton/empty state
- `stats !== null` → render 7 stat cards in grid layout
