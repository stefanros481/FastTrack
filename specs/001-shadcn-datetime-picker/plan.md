# Implementation Plan: ShadCN 24-Hour Date & Time Picker

**Branch**: `001-shadcn-datetime-picker` | **Date**: 2026-02-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-shadcn-datetime-picker/spec.md`

## Summary

Replace the existing `DateTimePicker` component (calendar + number inputs) in the session edit modal with the ShadCN 24-hour date-time picker: a single popover containing a month calendar plus two scrollable columns (hours 0–23, minutes in 5-step increments). The component interface is unchanged — only the visual implementation is replaced. One new ShadCN component (`ScrollArea`) is added via CLI.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, ShadCN (Calendar, Popover, Button, ScrollArea), date-fns 4, lucide-react
**Storage**: N/A — no database changes
**Testing**: Manual verification (no automated test suite in project)
**Target Platform**: Web — mobile-first, 375 px minimum viewport
**Project Type**: Web application (mobile-first PWA, personal tool)
**Performance Goals**: Picker opens and is interactive within 300 ms; selected hour/minute pre-scrolled into view on open
**Constraints**: 44×44 px minimum touch targets (`min-h-11 min-w-11`); no new npm dependencies beyond what `radix-ui` already provides; design token system must be respected
**Scale/Scope**: Up to 5 users; single-file UI change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post Phase 1 design.*

| Principle | Gate | Pre-Design | Post-Design |
|-----------|------|-----------|-------------|
| I. Mobile-First | Picker usable at 375 px; core action (edit session time) ≤ 3 taps | ✅ Popover layout uses `sm:flex` — stacks vertically on mobile; 3-tap max (date, hour, minute) | ✅ Confirmed — no horizontal scroll at 390 px |
| II. Security by Default | No new routes, actions, or data access | ✅ Pure UI component — zero server-side changes | ✅ Unchanged |
| III. Server-First | DateTimePicker is a client component; no RSC regression | ✅ `"use client"` component, no RSC affected | ✅ Unchanged |
| IV. Data Integrity | Existing Zod validation untouched | ✅ Component fires `onChange(Date)` — same as before; `sessionEditSchema` unchanged | ✅ Confirmed |
| V. Premium Simplicity | Use design tokens; no ad-hoc hex; lucide-react icons only | ✅ Will use `--color-primary` for selected state; lucide CalendarIcon replaces @radix-ui/react-icons | ✅ Confirmed |

**No violations. No complexity justification required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-shadcn-datetime-picker/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 complete
├── data-model.md        ✅ Phase 1 complete
├── quickstart.md        ✅ Phase 1 complete
└── tasks.md             ⬜ Phase 2 — created by /speckit.tasks
```

### Source Code Changes

```text
src/components/ui/
├── date-time-picker.tsx     # REWRITE — new ShadCN 24h implementation, same interface
└── scroll-area.tsx          # NEW — added via `bunx shadcn add scroll-area`

# All other files: NO CHANGES
src/components/SessionDetailModal.tsx   # unchanged
src/lib/validators.ts                   # unchanged
src/app/actions/fasting.ts              # unchanged
prisma/schema.prisma                    # unchanged
```

**Structure Decision**: Single-project web app. Only `src/components/ui/` is touched. No backend, no database, no auth changes.

## Implementation Approach

### Task 1 — Add ScrollArea via shadcn CLI

```bash
bunx shadcn add scroll-area
```

Creates `src/components/ui/scroll-area.tsx`. No new npm dependencies (uses existing `radix-ui`).

### Task 2 — Rewrite `date-time-picker.tsx`

Replace the current calendar + number inputs implementation with:

- Single `Popover` trigger showing the formatted date-time string
- `CalendarIcon` from `lucide-react` (not `@radix-ui/react-icons`)
- Trigger format: `format(value, "MMM d, yyyy HH:mm")` → e.g. "Feb 25, 2026 18:00"
- Popover content: `<div className="sm:flex">` with Calendar + two ScrollArea columns
- Hours: 0–23 (24 buttons), rendered in reverse order to match reference
- Minutes: 5-step increments — `Array.from({ length: 12 }, (_, i) => i * 5)`
- Pre-selection: selected hour/minute use `variant="default"` (filled); others use `variant="ghost"`
- Minute pre-selection snapping: `Math.floor(value.getMinutes() / 5) * 5`
- `useEffect` with `scrollIntoView({ block: 'center' })` when popover opens to bring selected values into view
- `error` prop: adds `border-red-500` class to trigger button (same as current)
- Component name stays `DateTimePicker` — no import changes anywhere

### Key implementation details

- The component remains **controlled** — no internal date state, only `isOpen`
- `handleDateSelect` merges the calendar-selected date with the current hour/minute
- `handleTimeChange` creates a new `Date` from current `value` with updated hour or minute
- All buttons must satisfy `min-h-11 min-w-11` (44×44 px touch target — Constitution I)
- Use ShadCN's `variant="default"` for selected-state styling — it maps to `bg-primary` which is already themed to the project's indigo primary color. No custom color override needed.
