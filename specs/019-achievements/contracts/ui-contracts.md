# UI Contracts: Achievements & Badges

**Feature**: 019-achievements | **Date**: 2026-03-06

## Navigation Changes

### Bottom Navigation (FastingTimer.tsx)

**When gamification enabled** (`gamificationEnabled === true` AND `gamificationAchievements === true`):

| Position | Tab | Icon | Action |
|----------|-----|------|--------|
| 1 | Timer | `Timer` | `setView("timer")` |
| 2 | Insights | `BarChart3` | `setView("dashboard")` |
| 3 | Community | `Users` | `setView("community")` |
| 4 | Log | `History` | `setView("history")` |

**When gamification disabled** (original layout):

| Position | Tab | Icon | Action |
|----------|-----|------|--------|
| 1 | Timer | `Timer` | `setView("timer")` |
| 2 | Insights | `BarChart3` | `setView("dashboard")` |
| 3 | Log | `History` | `setView("history")` |
| 4 | Settings | `Settings` | `Link href="/settings"` |

### Header (FastingTimer.tsx)

**When gamification enabled**: Add `Settings` gear icon (`<Link href="/settings">`) to the right side of the header, before `ConnectionStatus` and `ThemeToggle`.

**When gamification disabled**: No header change.

---

## Component Contracts

### CommunityView

**Type**: Client component
**File**: `src/components/CommunityView.tsx`
**Rendered when**: `view === "community"` in FastingTimer

**Props**: None — fetches badge data internally via `getBadges()` server action on mount.

```typescript
// Internal state
const [badgeState, setBadgeState] = useState<ComputedBadgeState | null>(null);
const [loading, setLoading] = useState(true);
```

**Layout**:
- Section header: "Achievements" with badge count (e.g., "5/19")
- Badge grid: 3 columns on mobile, organized by category
- Each category has a heading row

---

### AchievementsGrid

**Type**: Client component
**File**: `src/components/AchievementsGrid.tsx`

**Props**:
```typescript
interface AchievementsGridProps {
  badgeState: ComputedBadgeState;
}
```

**Layout**:
- Grouped by category with category header
- 3-column grid (responsive)
- Each badge: icon + label + earned/locked state
- Earned badges: full color, icon highlighted
- Locked badges: muted color, reduced opacity
- Progress text below locked badges (e.g., "7/10")

**Touch targets**: Each badge cell minimum 44x44px

---

### BadgeCelebration

**Type**: Client component
**File**: `src/components/BadgeCelebration.tsx`

**Props**:
```typescript
interface BadgeCelebrationProps {
  newBadgeIds: string[];       // Badge IDs not yet in localStorage
  onAllSeen: () => void;       // Called when user dismisses all celebrations
}
```

**Behavior**:
1. Shows full-screen overlay (z-index above nav, below modals)
2. Displays one badge at a time with bounce-in animation
3. Badge icon (large, colored) + label + description
4. Queue indicator ("1 of 3") when multiple badges earned
5. Button: "Next" when more badges remain, "Done" on last badge (44px touch target, rounded-full, primary color)
6. Backdrop tap does NOT dismiss (prevents accidental skips)
7. Each dismissed badge ID is written to localStorage immediately (per-badge, not batch)
8. Uses `motion-safe:animate-bounce-in` for entrance

**localStorage interaction**:
- Read: `JSON.parse(localStorage.getItem("fasttrack:celebrations-seen") || "{}")`
- Write (per-badge on dismiss): `seenMap[badgeId] = Date.now(); localStorage.setItem("fasttrack:celebrations-seen", JSON.stringify(seenMap))`
- Diff: `newBadges = earned.filter(id => !(id in seenMap))`

---

## Data Flow

```
page.tsx (server)
  ├── getGamificationSettings() → { enabled, achievements }
  └── passes gamificationEnabled to FastingTimer as prop

FastingTimer (client)
  ├── Conditionally shows Community tab (if gamification enabled)
  ├── Shows gear icon in header (if gamification enabled)
  └── When view === "community":
      └── CommunityView
          ├── Lazy-fetches getBadges() on first mount (avoids cost on every page load)
          ├── AchievementsGrid (renders after badge data loads)
          └── BadgeCelebration (only if new badges detected via localStorage diff)
```

**Note**: Badge data is fetched lazily inside `CommunityView` when the Community tab is first selected, not on every page load. This avoids computing badges for users who primarily use the Timer tab. The server action `getBadges()` is called via `useEffect` or `startTransition` on mount.
