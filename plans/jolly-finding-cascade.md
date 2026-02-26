# Plan: Replace native datetime-local with shadcn Date+Time Picker

## Context

The native `<input type="datetime-local">` in `SessionDetailModal.tsx` renders a poor UX — especially on desktop/macOS Safari where the picker is clunky. The user wants a proper shadcn/ui date-time picker instead.

shadcn's date-time picker pattern = **Calendar popover** (for date) + **`<input type="time">`** (for time), styled consistently. This gives a polished calendar UI while keeping time input simple and functional.

## What changes

### Step 1: Initialize shadcn/ui

Run `bunx shadcn@latest init` to set up the project for shadcn components. This will:
- Create `components.json` config
- Add CSS variables for shadcn theming to `src/app/globals.css`
- Install utility deps (`clsx`, `tailwind-merge`, `class-variance-authority`)
- Create `src/lib/utils.ts` with the `cn()` helper

We'll map shadcn's CSS variables to our existing design tokens where possible (e.g. `--primary` → our indigo-600).

### Step 2: Add required shadcn components

```
bunx shadcn@latest add calendar popover button
```

This installs:
- `react-day-picker` + `date-fns` (for Calendar)
- `@radix-ui/react-popover` (for Popover)
- The Calendar, Popover, and Button UI primitives

### Step 3: Build a `DateTimePicker` component

Create `src/components/ui/date-time-picker.tsx` — a reusable component that:
- Shows a button displaying the selected date+time
- Opens a popover with a `Calendar` for date selection
- Includes a styled `<input type="time">` below the calendar
- Combines both into a single `Date` value via `onChange(date: Date)`
- Styled to match our design system (indigo primary, rounded-xl, min-h-11 touch targets)

### Step 4: Update `SessionDetailModal.tsx`

Replace the two `<input type="datetime-local">` fields with two `<DateTimePicker>` instances:
- Start Time picker (pre-filled with `session.startedAt`)
- End Time picker (pre-filled with `session.endedAt`)
- Keep all existing validation, error display, and save logic intact

### Files modified
- `src/app/globals.css` — shadcn CSS variables added
- `src/lib/utils.ts` — NEW, `cn()` helper (created by shadcn init)
- `src/components/ui/calendar.tsx` — NEW (shadcn component)
- `src/components/ui/popover.tsx` — NEW (shadcn component)
- `src/components/ui/button.tsx` — NEW (shadcn component)
- `src/components/ui/date-time-picker.tsx` — NEW (custom component)
- `src/components/SessionDetailModal.tsx` — MODIFIED (swap inputs for DateTimePicker)
- `components.json` — NEW (shadcn config, created by init)

### Dependencies added
- `date-fns`, `react-day-picker`, `@radix-ui/react-popover`, `clsx`, `tailwind-merge`, `class-variance-authority`

## Verification

1. `bunx tsc --noEmit` — type-check passes
2. `bun run build` — production build succeeds
3. Manual: open modal → tap date button → calendar popover opens → select date → time input works → duration recalculates → Save works
