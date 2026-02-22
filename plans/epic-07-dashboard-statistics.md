# Epic 7: Dashboard — Statistics

Summary stat cards computed server-side via Prisma aggregate queries, scoped to the authenticated user. Stats refresh on each dashboard navigation.

**Stats to compute:**

| Stat | Calculation |
|------|-------------|
| Total fasts | `COUNT(*)` of completed sessions |
| Average duration | `AVG(endedAt - startedAt)` |
| Longest fast | `MAX(endedAt - startedAt)` |
| Current streak | Consecutive days with ≥ 1 completed fast |
| Best streak | Longest consecutive-day streak ever |
| This week | Count + total hours for current ISO week |
| This month | Count + total hours for current calendar month |

---

## US-7.1 — View summary statistics

*As a user, I want to see key fasting statistics so that I can understand my overall behavior.*

**Acceptance criteria:**
- Dashboard shows stat cards: total fasts, average duration, longest fast, current streak, best streak
- "This week" and "This month" summaries
- Stats computed server-side via Prisma aggregate queries
- Stats refresh when navigating to the dashboard

**Design:**
- Stat card: `bg-[--color-card]`, `rounded-2xl`, `p-4`; grid layout `gap-3` (12px between cards)
- Stat value: Display level — `text-3xl font-bold text-[--color-text]`
- Stat label: Muted level — `text-sm text-[--color-text-muted]`
- Streak cards: streak count in `text-[--color-primary]` to highlight; best streak in `text-[--color-success]`
- Loading state: shimmer skeleton cards matching stat card dimensions (shimmer via `::after` pseudo-element per design token pattern)
- Entrance: `motion-safe:animate-fade-in` on the stats section

---

**Key files:** `src/app/dashboard/page.tsx`, `src/app/api/stats/route.ts`, `src/components/StatsCards.tsx`
