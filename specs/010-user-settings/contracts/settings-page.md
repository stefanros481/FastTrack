# Contract: Settings Page Layout

**File**: `src/app/settings/page.tsx`
**Type**: Server Component

## Page Structure

```
┌─────────────────────────┐
│     Profile Section      │
│  ┌────┐                  │
│  │ 🖼️ │ Name             │
│  │    │ email@example.com │
│  └────┘                  │
├─────────────────────────┤
│     Fasting              │  ← Section header
│  ┌─────────────────────┐│
│  │ Default Goal   [btn] ││  ← DefaultGoalSetting component
│  └─────────────────────┘│
├─────────────────────────┤
│     Notifications        │  ← Section header
│  ┌─────────────────────┐│
│  │ Daily Reminder [tog] ││
│  │ Reminder Time  [sel] ││  ← Visible only when toggle is on
│  │ Max Duration   [inp] ││
│  └─────────────────────┘│
├─────────────────────────┤
│     Appearance           │  ← Section header
│  ┌─────────────────────┐│
│  │ Theme  [D] [S] [L]  ││  ← Segmented control
│  └─────────────────────┘│
├─────────────────────────┤
│     Account              │  ← Section header
│  ┌─────────────────────┐│
│  │     Sign Out         ││  ← Destructive action, bottom of page
│  └─────────────────────┘│
└─────────────────────────┘
```

## Data Loading (Server)

The page server component fetches:
1. `auth()` → session with `user.id`
2. `User` record (name, email, image) by session user ID
3. `UserSettings` record (theme, defaultGoalMinutes, reminderEnabled, reminderTime, maxDurationMinutes)

## Styling (from epic-10)

- Page background: `bg-[--color-background]`
- Section headers: `text-xl font-semibold text-[--color-text]`, `gap-8` between sections
- Each settings group: `bg-[--color-card]`, `rounded-2xl`, `p-4`
- Row label: `text-base text-[--color-text]`; hint: `text-sm text-[--color-text-muted]`
- Page entrance: `motion-safe:animate-fade-in`

## Component Props

### UserProfile
```
{ name: string | null, email: string, image: string | null }
```
- Displays circular avatar (48px), name, and email
- Falls back to letter avatar when image is null or fails to load

### ThemeSelector
```
{ currentTheme: string }
```
- 3-button segmented control: Dark / System / Light
- Calls `updateTheme()` server action on change
- Uses Lucide icons: Moon, Monitor, Sun

### NotificationSettings
```
{ reminderEnabled: boolean, reminderTime: string | null, maxDurationMinutes: number | null }
```
- Toggle for daily reminder
- Time input (visible when toggle on)
- Number input for max duration (hours)

### DefaultGoalSetting (existing)
```
{ currentDefault: number | null }
```
- No changes needed

### SignOutButton
```
{}
```
- Calls `signOut()` server action
- Styled as destructive action (red text or muted)
