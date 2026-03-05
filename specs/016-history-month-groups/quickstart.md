# Quickstart: History Month Groups

**Branch**: `016-history-month-groups` | **Date**: 2026-03-05

## What This Feature Does

Groups fasting sessions in the Log tab by month with collapsible sections. Makes it easy to navigate through months of fasting history without scrolling through a long flat list.

## Files to Create

1. **`src/components/MonthGroup.tsx`** — Collapsible month section
   - Tappable header with month label, session count, and chevron indicator
   - Collapses/expands sessions with CSS grid animation
   - Chevron rotates smoothly between collapsed (right) and expanded (down)

## Files to Modify

2. **`src/components/HistoryList.tsx`**
   - Group flat sessions array into month buckets using `useMemo`
   - Track expanded months with `Set<string>` state
   - Default: most recent month expanded, all others collapsed
   - Render `MonthGroup` components instead of flat session cards
   - Infinite scroll and modal behavior unchanged

## Implementation Order

1. Create `MonthGroup` component (standalone, can render with mock data)
2. Add grouping logic to `HistoryList` with `useMemo`
3. Add expand/collapse state management
4. Integrate `MonthGroup` into `HistoryList` render output
5. Verify infinite scroll still works with grouped rendering

## Testing

- Open Log tab with sessions in 3+ months → current month expanded, others collapsed with session counts
- Tap a collapsed month → expands to show sessions with chevron rotation
- Tap an expanded month → collapses with chevron rotation
- Scroll down to trigger infinite scroll → new sessions merge into existing month groups or create new collapsed groups
- Delete the only session in a month → month header disappears
- Check 375px viewport → month headers fit without overflow
- Check dark mode → colors correct in both themes
