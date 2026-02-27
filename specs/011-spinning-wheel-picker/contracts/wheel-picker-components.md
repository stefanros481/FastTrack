# UI Component Contracts: Wheel Picker

## WheelDateTimePicker

Replaces `DateTimePicker` in session editing contexts.

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| value | Date | Yes | Current selected date/time |
| onChange | (date: Date) => void | Yes | Callback when value changes |
| maxDate | Date \| undefined | No | Maximum selectable date/time (e.g., now) |
| error | boolean | No | Whether to show error styling |

**Behavior**:
- Opens as bottom sheet overlay when triggered
- 3 drums: month/day, hour (00–23), minute (00–59)
- Pre-selects current `value` on open
- Calls `onChange` on confirm
- Backdrop tap dismisses without saving
- Respects light/dark theme

**Replaces**: `src/components/ui/date-time-picker.tsx` usage in `SessionDetailModal.tsx`

---

## WheelTimePicker

Time-only variant for notification reminder settings.

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| value | string | Yes | Current time in "HH:MM" format |
| onChange | (time: string) => void | Yes | Callback with "HH:MM" string |

**Behavior**:
- Opens as bottom sheet overlay when triggered
- 2 drums: hour (00–23), minute (00–59)
- Pre-selects current `value` on open
- Calls `onChange` on confirm
- Backdrop tap dismisses without saving
- Respects light/dark theme

**Replaces**: `<input type="time">` in `NotificationSettings.tsx`

---

## Server Action: updateActiveStartTime

**Location**: `src/app/actions/fasting.ts`

**Signature**: `updateActiveStartTime(sessionId: string, newStartedAt: Date) => Promise<{ success: boolean; error?: string }>`

**Validation**:
- User must be authenticated
- Session must exist and belong to authenticated user
- Session must be active (`endedAt` IS NULL)
- `newStartedAt` must be in the past
- `newStartedAt` must not overlap with previous completed session

**Side Effects**:
- Updates `FastingSession.startedAt`
- Calls `revalidatePath("/")`
