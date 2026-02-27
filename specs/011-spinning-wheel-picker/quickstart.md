# Quickstart: Spinning Wheel Date/Time Picker

## Scenario 1: Edit completed session start time

1. Navigate to home page → tap History tab
2. Tap any completed session to open SessionDetailModal
3. Tap the "Start Time" field
4. A bottom sheet slides up with 3 spinning drums: month/day, hour, minute
5. Scroll the hour drum from current value to a new value
6. Tap "Confirm" (or equivalent)
7. The session detail updates with the new start time
8. Duration recalculates automatically
9. Tap "Save" to persist

**Expected**: Start time updates, duration adjusts, validation still applies (start < end).

## Scenario 2: Edit active session start time

1. Start a new fast from the home screen
2. The timer begins counting from now
3. Tap the "Started [time]" text on the active fast screen
4. A bottom sheet slides up with spinning drums pre-set to the current start time
5. Scroll to select a time 2 hours earlier (back-dating)
6. Tap "Confirm"
7. The elapsed timer jumps to show 2+ hours elapsed
8. The start time display updates

**Expected**: Timer recalculates, server persists new start time, future times are blocked.

## Scenario 3: Set notification reminder time

1. Navigate to Settings → Notifications
2. Enable "Daily Reminder" toggle
3. Tap the reminder time field (currently shows "08:00" or similar)
4. A bottom sheet slides up with 2 spinning drums: hour, minute
5. Scroll to select 07:30
6. Tap "Confirm"
7. The reminder time field now shows "07:30"

**Expected**: Time persisted to UserSettings.reminderTime as "07:30".

## Scenario 4: Theme consistency

1. Switch app to dark mode (via theme toggle on home screen)
2. Open any spinning wheel picker (session edit, active session, or notification time)
3. Verify the bottom sheet and wheel drums use dark theme colors
4. Switch to light mode and repeat

**Expected**: Picker respects the current theme in both modes.
