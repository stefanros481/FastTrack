import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";
import { mockAuthenticated, mockUnauthenticated } from "../mocks/auth";
import { mockRevalidatePath } from "../mocks/next-cache";

// Import after mocks are set up (vi.mock is hoisted)
import {
  startFast,
  stopFast,
  deleteSession,
  getActiveFast,
  getStats,
  updateSession,
  updateNote,
} from "@/app/actions/fasting";
import { MIN_FAST_MS } from "@/lib/validators";

beforeEach(() => {
  vi.resetAllMocks();
  mockAuthenticated();
});

describe("startFast", () => {
  it("creates session when no active fast exists", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue(null);
    const created = {
      id: "new-session",
      startedAt: new Date(),
      goalMinutes: null,
      userId: "test-user-id",
    };
    mockPrisma.fastingSession.create.mockResolvedValue(created);

    const result = await startFast();

    expect(mockPrisma.fastingSession.findFirst).toHaveBeenCalledWith({
      where: { userId: "test-user-id", endedAt: null },
    });
    expect(mockPrisma.fastingSession.create).toHaveBeenCalledWith({
      data: {
        userId: "test-user-id",
        startedAt: expect.any(Date),
        goalMinutes: null,
      },
    });
    expect(result).toEqual(created);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("passes goalMinutes when provided", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue(null);
    mockPrisma.fastingSession.create.mockResolvedValue({ id: "s1" });

    await startFast(960);

    expect(mockPrisma.fastingSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ goalMinutes: 960 }),
    });
  });

  it("throws when active fast already exists", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ id: "existing" });

    await expect(startFast()).rejects.toThrow("A fast is already active");
    expect(mockPrisma.fastingSession.create).not.toHaveBeenCalled();
  });

  it("throws Unauthorized when not authenticated", async () => {
    mockUnauthenticated();

    await expect(startFast()).rejects.toThrow("Unauthorized");
  });
});

describe("stopFast", () => {
  it("ends session when duration >= 8 hours", async () => {
    const startedAt = new Date(Date.now() - 9 * 3600_000); // 9h ago
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ startedAt });
    const updated = { id: "s1", startedAt, endedAt: new Date() };
    mockPrisma.fastingSession.update.mockResolvedValue(updated);

    const result = await stopFast("s1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session).toEqual(updated);
    }
    expect(mockPrisma.fastingSession.update).toHaveBeenCalledWith({
      where: { id: "s1", userId: "test-user-id", endedAt: null },
      data: { endedAt: expect.any(Date) },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("rejects session below minimum duration", async () => {
    const startedAt = new Date(Date.now() - 4 * 3600_000); // 4h ago
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ startedAt });

    const result = await stopFast("s1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("at least");
    }
    expect(mockPrisma.fastingSession.update).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns success when session already ended (not found)", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue(null);

    const result = await stopFast("s1");

    expect(result).toEqual({ success: true, session: null });
    expect(mockPrisma.fastingSession.update).not.toHaveBeenCalled();
  });

  it("handles P2025 race condition gracefully", async () => {
    const startedAt = new Date(Date.now() - 9 * 3600_000);
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ startedAt });

    // Simulate P2025: record was deleted/updated between findFirst and update
    const prismaError = new Error("Record not found");
    Object.defineProperty(prismaError, "code", { value: "P2025" });
    Object.defineProperty(prismaError, "constructor", {
      value: { name: "PrismaClientKnownRequestError" },
    });
    // The actual check uses instanceof, so we need to mock properly
    // Instead, let's use the Prisma import pattern
    mockPrisma.fastingSession.update.mockRejectedValue(
      createPrismaError("P2025")
    );

    const result = await stopFast("s1");

    expect(result).toEqual({ success: true, session: null });
  });

  it("throws on unexpected Prisma error", async () => {
    const startedAt = new Date(Date.now() - 9 * 3600_000);
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ startedAt });
    mockPrisma.fastingSession.update.mockRejectedValue(
      new Error("Connection lost")
    );

    await expect(stopFast("s1")).rejects.toThrow("Failed to end session");
  });

  it("throws Unauthorized when not authenticated", async () => {
    mockUnauthenticated();

    await expect(stopFast("s1")).rejects.toThrow("Unauthorized");
  });

  // KEY REGRESSION TEST: This is the scenario from the stale closure bug.
  // A 12-hour fast should be SAVED (stopFast), not DELETED (deleteSession).
  it("12-hour session returns success with endedAt set", async () => {
    const startedAt = new Date(Date.now() - 12 * 3600_000); // 12h ago
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ startedAt });
    const updated = {
      id: "s1",
      startedAt,
      endedAt: expect.any(Date),
    };
    mockPrisma.fastingSession.update.mockResolvedValue(updated);

    const result = await stopFast("s1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session).toBeDefined();
      expect(result.session).not.toBeNull();
    }
    // Verify update was called (not delete)
    expect(mockPrisma.fastingSession.update).toHaveBeenCalled();
    expect(mockPrisma.fastingSession.delete).not.toHaveBeenCalled();
  });
});

describe("deleteSession", () => {
  it("deletes session successfully", async () => {
    mockPrisma.fastingSession.delete.mockResolvedValue({});

    const result = await deleteSession("session-1");

    expect(result).toEqual({ success: true });
    expect(mockPrisma.fastingSession.delete).toHaveBeenCalledWith({
      where: { id: "session-1", userId: "test-user-id" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns error on empty sessionId", async () => {
    const result = await deleteSession("");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid session ID");
    }
  });

  it("returns error when session not found", async () => {
    mockPrisma.fastingSession.delete.mockRejectedValue(
      new Error("Record not found")
    );

    const result = await deleteSession("nonexistent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Session not found");
    }
  });
});

describe("getActiveFast", () => {
  it("returns active session", async () => {
    const session = {
      id: "s1",
      startedAt: new Date(),
      goalMinutes: 960,
      notes: null,
    };
    mockPrisma.fastingSession.findFirst.mockResolvedValue(session);

    const result = await getActiveFast();

    expect(result).toEqual(session);
    expect(mockPrisma.fastingSession.findFirst).toHaveBeenCalledWith({
      where: { userId: "test-user-id", endedAt: null },
      orderBy: { startedAt: "desc" },
      select: { id: true, startedAt: true, goalMinutes: true, notes: true },
    });
  });

  it("returns null when no active session", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue(null);

    const result = await getActiveFast();

    expect(result).toBeNull();
  });
});

describe("updateNote", () => {
  it("updates note successfully", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue({ id: "s1" });
    mockPrisma.fastingSession.update.mockResolvedValue({});

    const result = await updateNote("s1", "Great fast!");

    expect(result).toEqual({ success: true });
    expect(mockPrisma.fastingSession.update).toHaveBeenCalledWith({
      where: { id: "s1", userId: "test-user-id" },
      data: { notes: "Great fast!" },
    });
  });

  it("rejects note over 280 chars", async () => {
    const result = await updateNote("s1", "a".repeat(281));

    expect(result.success).toBe(false);
    expect(mockPrisma.fastingSession.update).not.toHaveBeenCalled();
  });

  it("returns error when session not found", async () => {
    mockPrisma.fastingSession.findFirst.mockResolvedValue(null);

    const result = await updateNote("s1", "note");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Session not found");
    }
  });
});

describe("getStats", () => {
  it("returns null when no completed sessions", async () => {
    mockPrisma.fastingSession.findMany.mockResolvedValue([]);

    const result = await getStats();

    expect(result).toBeNull();
  });

  it("computes correct totals", async () => {
    const now = new Date();
    const sessions = [
      {
        startedAt: new Date(now.getTime() - 12 * 3600_000),
        endedAt: now,
        goalMinutes: 720,
      },
      {
        startedAt: new Date(now.getTime() - 36 * 3600_000),
        endedAt: new Date(now.getTime() - 24 * 3600_000),
        goalMinutes: 480,
      },
    ];
    mockPrisma.fastingSession.findMany.mockResolvedValue(sessions);

    const result = await getStats();

    expect(result).not.toBeNull();
    expect(result!.totalFasts).toBe(2);
    expect(result!.totalHours).toBeCloseTo(24, 0); // 12h + 12h
    expect(result!.avgHours).toBeCloseTo(12, 0);
    expect(result!.longestFast).toBeCloseTo(12, 0);
  });

  it("counts goals met correctly", async () => {
    const now = new Date();
    const sessions = [
      {
        // 12h fast, 8h goal → met
        startedAt: new Date(now.getTime() - 12 * 3600_000),
        endedAt: now,
        goalMinutes: 480,
      },
      {
        // 9h fast, 16h goal → not met
        startedAt: new Date(now.getTime() - 33 * 3600_000),
        endedAt: new Date(now.getTime() - 24 * 3600_000),
        goalMinutes: 960,
      },
      {
        // 10h fast, no goal → not counted
        startedAt: new Date(now.getTime() - 58 * 3600_000),
        endedAt: new Date(now.getTime() - 48 * 3600_000),
        goalMinutes: null,
      },
    ];
    mockPrisma.fastingSession.findMany.mockResolvedValue(sessions);

    const result = await getStats();

    expect(result!.goalsMet).toBe(1);
  });
});

// Helper to create a Prisma-like error for P2025 testing
function createPrismaError(code: string) {
  // We need to match the instanceof check in stopFast:
  // err instanceof Prisma.PrismaClientKnownRequestError
  // Since we mock Prisma, we import the actual error class
  const { Prisma } = require("@prisma/client");
  const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
    code,
    clientVersion: "7.0.0",
  });
  return error;
}
