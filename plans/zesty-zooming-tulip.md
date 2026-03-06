# Gamification Settings & Opt-In Splash

## Context

The gamification plan (`plans/spicy-orbiting-rain.md`) introduces 4 social/competitive features (Achievements, Who's Fasting Now, Leaderboard, Weekly Challenge). Users must be able to opt in/out of gamification entirely and toggle individual features. If a user hasn't decided yet, a splash screen prompts them to choose before they see gamification content.

## Schema (already done)

5 new fields on `UserSettings` in `prisma/schema.prisma`:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `gamificationEnabled` | `Boolean?` | `null` | `null` = undecided (show splash), `true` = opted in, `false` = opted out |
| `gamificationAchievements` | `Boolean` | `true` | Toggle achievements/badges |
| `gamificationWhosFasting` | `Boolean` | `true` | Toggle "Who's Fasting Now" |
| `gamificationLeaderboard` | `Boolean` | `true` | Toggle group leaderboard |
| `gamificationChallenge` | `Boolean` | `true` | Toggle weekly challenge |

New users get defaults via existing `settings: { create: {} }` pattern in `src/lib/auth.ts` — no changes needed there.

## Implementation

### 1. Prisma Migration

Run `bunx prisma migrate dev --name add-gamification-settings` to create migration for the 5 new fields.

### 2. Server Actions — `src/app/actions/settings.ts`

Add two new server actions following existing patterns:

- `getGamificationSettings()` — returns `{ enabled: boolean | null, achievements: boolean, whosFasting: boolean, leaderboard: boolean, challenge: boolean }`
- `updateGamificationSettings(settings)` — accepts partial update object, validates booleans, updates DB

### 3. GamificationSettings Component — `src/components/GamificationSettings.tsx` (NEW)

Settings page section with:
- **Master toggle**: "Enable Gamification" — on/off switch (same toggle pattern as `NotificationSettings.tsx` line 75-91)
- **When enabled**: 4 individual feature toggles appear below with `motion-safe:animate-fade-in`:
  - "Achievements & Badges"
  - "Who's Fasting Now"
  - "Group Leaderboard"
  - "Weekly Challenge"
- Each toggle uses `useTransition` + server action pattern
- When master toggle is off, individual toggles are hidden (not just disabled)

### 4. Settings Page — `src/app/settings/page.tsx` (MODIFY)

- Import `getGamificationSettings` and `GamificationSettings`
- Add to `Promise.all` data fetch
- Add new "Community" section between Notifications and Account with the `GamificationSettings` component

### 5. GamificationOptIn Component — `src/components/GamificationOptIn.tsx` (NEW)

Full-screen overlay/splash shown when `gamificationEnabled === null`:
- Card-style modal centered on screen with backdrop
- Title: "Join the Community?"
- Brief description of what gamification includes (achievements, seeing who's fasting, leaderboard, challenges)
- Two buttons: "Join In" (primary) and "No Thanks" (secondary/outline)
- "Join In" calls `updateGamificationSettings({ enabled: true })`, "No Thanks" calls `updateGamificationSettings({ enabled: false })`
- Subtext: "You can change this anytime in Settings"
- Uses `motion-safe:animate-slide-up` entrance animation

### 6. Main Page Integration — `src/app/page.tsx` (MODIFY)

- Fetch `getGamificationSettings()` in `Promise.all`
- Pass `gamificationEnabled` to `FastingTimer` as a new prop

### 7. FastingTimer Integration — `src/components/FastingTimer.tsx` (MODIFY)

- Accept `gamificationEnabled: boolean | null` prop
- When `gamificationEnabled === null`, render `<GamificationOptIn />` overlay on top of the timer view
- After user makes a choice, the overlay disappears (optimistic state update + server action)

## Files Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | DONE — fields already added |
| `prisma/migrations/...` | NEW — auto-generated migration |
| `src/app/actions/settings.ts` | MODIFY — add get/update gamification actions |
| `src/components/GamificationSettings.tsx` | NEW — settings page toggles |
| `src/components/GamificationOptIn.tsx` | NEW — opt-in splash screen |
| `src/app/settings/page.tsx` | MODIFY — add Community section |
| `src/app/page.tsx` | MODIFY — fetch gamification settings |
| `src/components/FastingTimer.tsx` | MODIFY — accept prop, show opt-in splash |

## Verification

1. Fresh user (or clear `gamificationEnabled` to null in DB): splash screen appears on timer view
2. Click "Join In" → splash disappears, settings saved as `enabled: true`
3. Click "No Thanks" → splash disappears, settings saved as `enabled: false`
4. Settings page: Community section shows master toggle + 4 feature toggles when enabled
5. Turn off master toggle → feature toggles hide
6. `bunx prisma migrate dev` succeeds
7. `bun run build` passes with no TypeScript errors
8. Dark mode: splash and settings render correctly
