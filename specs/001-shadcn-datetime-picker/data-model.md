# Data Model: ShadCN 24-Hour Date & Time Picker

**Feature**: 001-shadcn-datetime-picker
**Date**: 2026-02-28

## Overview

This feature is a pure UI component replacement. No database schema changes, no new server actions, and no new Prisma models are required. The data model below describes the component's props interface and internal state only.

---

## Component Interface

### `DateTimePicker` (replaces existing implementation)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `Date` | Yes | The currently selected date and time |
| `onChange` | `(date: Date) => void` | Yes | Called immediately when date, hour, or minute changes |
| `error` | `boolean` | No | When `true`, applies red-border error styling to the trigger button |
| `id` | `string` | No | Optional HTML id for accessibility label binding |

**Interface contract**: unchanged from the current `DateTimePicker`. `SessionDetailModal.tsx` requires no modifications.

---

## Internal State

| State variable | Type | Initial value | Description |
|---------------|------|---------------|-------------|
| `isOpen` | `boolean` | `false` | Controls popover open/closed |

The component is **controlled** — it holds no internal date state. `value` is always the source of truth (passed from parent). Internal `isOpen` is the only local state.

---

## Minute Snapping Rule

When `value.getMinutes()` is not a multiple of 5, the pre-selected minute in the scroll list is:

```
selectedMinute = Math.floor(value.getMinutes() / 5) * 5
```

This is a display-only mapping. The `value` prop itself is not modified until the user taps a minute button, at which point `onChange` is called with the new rounded value.

---

## Affected Files (UI only)

| File | Change |
|------|--------|
| `src/components/ui/date-time-picker.tsx` | Full reimplementation (same interface, new rendering) |
| `src/components/ui/scroll-area.tsx` | New file — added via `bunx shadcn add scroll-area` |
| `src/components/SessionDetailModal.tsx` | No changes required |
| All other files | No changes required |
