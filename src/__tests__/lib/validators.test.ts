import { describe, it, expect } from "vitest";
import {
  sessionEditSchema,
  noteSchema,
  deleteSessionSchema,
  goalMinutesSchema,
  customGoalHoursSchema,
  themeSchema,
  reminderTimeSchema,
  maxDurationMinutesSchema,
  activeStartTimeSchema,
  MIN_FAST_MINUTES,
  MIN_FAST_SECONDS,
  MIN_FAST_MS,
} from "@/lib/validators";

describe("constants", () => {
  it("MIN_FAST values are consistent", () => {
    expect(MIN_FAST_MINUTES).toBe(480);
    expect(MIN_FAST_SECONDS).toBe(480 * 60);
    expect(MIN_FAST_MS).toBe(480 * 60 * 1000);
  });
});

describe("sessionEditSchema", () => {
  const validInput = () => ({
    sessionId: "session-1",
    startedAt: new Date(Date.now() - 10 * 3600_000), // 10h ago
    endedAt: new Date(Date.now() - 1 * 3600_000), // 1h ago
  });

  it("accepts valid input", () => {
    const result = sessionEditSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it("rejects when start >= end", () => {
    const input = validInput();
    input.startedAt = input.endedAt;
    const result = sessionEditSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects future startedAt", () => {
    const input = validInput();
    input.startedAt = new Date(Date.now() + 3600_000);
    input.endedAt = new Date(Date.now() + 12 * 3600_000);
    const result = sessionEditSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects future endedAt", () => {
    const input = validInput();
    input.endedAt = new Date(Date.now() + 3600_000);
    const result = sessionEditSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects duration below 8 hours", () => {
    const now = Date.now();
    const result = sessionEditSchema.safeParse({
      sessionId: "s1",
      startedAt: new Date(now - 7 * 3600_000 - 59 * 60_000), // 7h59m ago
      endedAt: new Date(now - 1000), // 1s ago
    });
    expect(result.success).toBe(false);
  });

  it("accepts exactly MIN_FAST_MS duration", () => {
    const now = Date.now();
    const result = sessionEditSchema.safeParse({
      sessionId: "s1",
      startedAt: new Date(now - MIN_FAST_MS - 60_000), // 8h01m ago
      endedAt: new Date(now - 60_000), // 1m ago (duration = 8h)
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty sessionId", () => {
    const input = { ...validInput(), sessionId: "" };
    const result = sessionEditSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("activeStartTimeSchema", () => {
  it("accepts past startedAt", () => {
    const result = activeStartTimeSchema.safeParse({
      sessionId: "s1",
      startedAt: new Date(Date.now() - 3600_000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects future startedAt", () => {
    const result = activeStartTimeSchema.safeParse({
      sessionId: "s1",
      startedAt: new Date(Date.now() + 3600_000),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty sessionId", () => {
    const result = activeStartTimeSchema.safeParse({
      sessionId: "",
      startedAt: new Date(Date.now() - 3600_000),
    });
    expect(result.success).toBe(false);
  });
});

describe("noteSchema", () => {
  it("accepts valid note", () => {
    const result = noteSchema.safeParse({ sessionId: "s1", note: "Good fast" });
    expect(result.success).toBe(true);
  });

  it("accepts null note", () => {
    const result = noteSchema.safeParse({ sessionId: "s1", note: null });
    expect(result.success).toBe(true);
  });

  it("accepts 280-char note", () => {
    const result = noteSchema.safeParse({
      sessionId: "s1",
      note: "a".repeat(280),
    });
    expect(result.success).toBe(true);
  });

  it("rejects note over 280 chars", () => {
    const result = noteSchema.safeParse({
      sessionId: "s1",
      note: "a".repeat(281),
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteSessionSchema", () => {
  it("accepts non-empty sessionId", () => {
    const result = deleteSessionSchema.safeParse({ sessionId: "s1" });
    expect(result.success).toBe(true);
  });

  it("rejects empty sessionId", () => {
    const result = deleteSessionSchema.safeParse({ sessionId: "" });
    expect(result.success).toBe(false);
  });
});

describe("goalMinutesSchema", () => {
  it("accepts 60 (1 hour)", () => {
    expect(goalMinutesSchema.safeParse(60).success).toBe(true);
  });

  it("accepts 4320 (72 hours)", () => {
    expect(goalMinutesSchema.safeParse(4320).success).toBe(true);
  });

  it("rejects below 60", () => {
    expect(goalMinutesSchema.safeParse(59).success).toBe(false);
  });

  it("rejects above 4320", () => {
    expect(goalMinutesSchema.safeParse(4321).success).toBe(false);
  });

  it("rejects non-integer", () => {
    expect(goalMinutesSchema.safeParse(60.5).success).toBe(false);
  });
});

describe("customGoalHoursSchema", () => {
  it("accepts 1-72 range", () => {
    expect(customGoalHoursSchema.safeParse(1).success).toBe(true);
    expect(customGoalHoursSchema.safeParse(72).success).toBe(true);
  });

  it("accepts decimals", () => {
    expect(customGoalHoursSchema.safeParse(16.5).success).toBe(true);
  });

  it("rejects 0", () => {
    expect(customGoalHoursSchema.safeParse(0).success).toBe(false);
  });

  it("rejects above 72", () => {
    expect(customGoalHoursSchema.safeParse(73).success).toBe(false);
  });
});

describe("themeSchema", () => {
  it("accepts valid themes", () => {
    expect(themeSchema.safeParse("dark").success).toBe(true);
    expect(themeSchema.safeParse("light").success).toBe(true);
    expect(themeSchema.safeParse("system").success).toBe(true);
  });

  it("rejects invalid theme", () => {
    expect(themeSchema.safeParse("blue").success).toBe(false);
  });
});

describe("reminderTimeSchema", () => {
  it("accepts valid HH:MM format", () => {
    expect(reminderTimeSchema.safeParse("08:30").success).toBe(true);
    expect(reminderTimeSchema.safeParse("23:59").success).toBe(true);
  });

  it("accepts null", () => {
    expect(reminderTimeSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid format", () => {
    expect(reminderTimeSchema.safeParse("8:30").success).toBe(false);
    expect(reminderTimeSchema.safeParse("abc").success).toBe(false);
  });
});

describe("maxDurationMinutesSchema", () => {
  it("accepts 60-4320 range", () => {
    expect(maxDurationMinutesSchema.safeParse(60).success).toBe(true);
    expect(maxDurationMinutesSchema.safeParse(4320).success).toBe(true);
  });

  it("accepts null", () => {
    expect(maxDurationMinutesSchema.safeParse(null).success).toBe(true);
  });

  it("rejects below 60", () => {
    expect(maxDurationMinutesSchema.safeParse(59).success).toBe(false);
  });

  it("rejects above 4320", () => {
    expect(maxDurationMinutesSchema.safeParse(4321).success).toBe(false);
  });
});
