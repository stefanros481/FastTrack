# Epic 10: Settings

User preferences stored server-side in `UserSettings` and loaded in the root layout server component so they're available app-wide.

---

## US-10.1 — Theme toggle

*As a user, I want to switch between dark and light mode.*

**Acceptance criteria:**
- Toggle in settings
- Preference persisted in `UserSettings.theme`
- Default: dark mode
- Theme applied via CSS variables and Tailwind dark mode classes

**Design:**
- Toggle: pill-style switch, `min-h-11` touch target for the row; active `bg-[--color-primary]`
- All color tokens (`--color-background`, `--color-card`, `--color-text`, etc.) are redefined under a `[data-theme="light"]` / `[data-theme="dark"]` selector in `index.css` — components consume them via `var()` without conditional class changes
- Theme transitions: 200ms ease-in-out on `background-color` and `color` properties

---

## US-10.2 — Settings persistence

*As a user, I want my settings saved server-side so that they persist across devices and sessions.*

**Acceptance criteria:**
- All settings stored in `UserSettings` table via `updateSettings()` server action
- Loaded on app initialization as part of the layout server component

---

**Settings surface covers:**
- Default fasting goal (`defaultGoalMinutes`)
- Daily reminder toggle + time (`reminderEnabled`, `reminderTime`)
- Max duration reminder (`maxDurationMinutes`)
- Theme toggle (`theme`)
- Sign out

**Design:**
- Settings page background: `bg-[--color-background]`
- Section headers: Heading level — `text-xl font-semibold text-[--color-text]`, `gap-8` between sections
- Each row: `bg-[--color-card]`, `rounded-2xl`, `p-4`, `min-h-11`, `border-b border-[--color-text-muted]/20` between rows within a group
- Row label: Body level — `text-base text-[--color-text]`; secondary hint: Muted — `text-sm text-[--color-text-muted]`
- Page entrance: `motion-safe:animate-fade-in`

---

**Key files:** `src/app/settings/page.tsx`, `src/actions/settings.ts`, `src/components/ThemeProvider.tsx`, `src/app/layout.tsx`
