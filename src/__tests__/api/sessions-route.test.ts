import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";
import { mockAuth } from "../mocks/auth";
import "../mocks/next-cache";

import { GET } from "@/app/api/sessions/route";
import { NextRequest } from "next/server";

function createRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/sessions");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

beforeEach(() => {
  vi.resetAllMocks();
  mockAuth.mockResolvedValue({
    user: { id: "test-user-id", email: "test@example.com" },
  });
});

describe("GET /api/sessions", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET(createRequest());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns paginated sessions with default pageSize", async () => {
    const now = new Date();
    const sessions = Array.from({ length: 21 }, (_, i) => ({
      id: `s${i}`,
      startedAt: new Date(now.getTime() - (i + 1) * 86400_000),
      endedAt: new Date(now.getTime() - i * 86400_000),
      goalMinutes: null,
      notes: null,
    }));
    mockPrisma.fastingSession.findMany.mockResolvedValue(sessions);

    const res = await GET(createRequest());
    const body = await res.json();

    expect(body.data).toHaveLength(20);
    expect(body.hasMore).toBe(true);
    expect(body.nextCursor).toBe("s19");
  });

  it("respects custom pageSize capped at 50", async () => {
    mockPrisma.fastingSession.findMany.mockResolvedValue([]);

    await GET(createRequest({ pageSize: "100" }));

    // Should query with 51 (50 + 1), not 101
    expect(mockPrisma.fastingSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 51 })
    );
  });

  it("defaults NaN pageSize to 20", async () => {
    mockPrisma.fastingSession.findMany.mockResolvedValue([]);

    await GET(createRequest({ pageSize: "abc" }));

    expect(mockPrisma.fastingSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 21 })
    );
  });

  it("returns hasMore=false when fewer results than pageSize", async () => {
    const sessions = [
      {
        id: "s1",
        startedAt: new Date(),
        endedAt: new Date(),
        goalMinutes: null,
        notes: null,
      },
    ];
    mockPrisma.fastingSession.findMany.mockResolvedValue(sessions);

    const res = await GET(createRequest());
    const body = await res.json();

    expect(body.hasMore).toBe(false);
    expect(body.nextCursor).toBeNull();
    expect(body.data).toHaveLength(1);
  });

  it("passes cursor for pagination", async () => {
    mockPrisma.fastingSession.findMany.mockResolvedValue([]);

    await GET(createRequest({ cursor: "cursor-id" }));

    expect(mockPrisma.fastingSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: "cursor-id" },
        skip: 1,
      })
    );
  });

  it("returns 500 on unexpected error", async () => {
    mockPrisma.fastingSession.findMany.mockRejectedValue(
      new Error("DB down")
    );

    const res = await GET(createRequest());

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });

  it("serializes dates as ISO strings", async () => {
    const startedAt = new Date("2026-01-01T10:00:00Z");
    const endedAt = new Date("2026-01-01T22:00:00Z");
    mockPrisma.fastingSession.findMany.mockResolvedValue([
      { id: "s1", startedAt, endedAt, goalMinutes: 720, notes: "test" },
    ]);

    const res = await GET(createRequest());
    const body = await res.json();

    expect(body.data[0].startedAt).toBe("2026-01-01T10:00:00.000Z");
    expect(body.data[0].endedAt).toBe("2026-01-01T22:00:00.000Z");
    expect(body.data[0].goalMinutes).toBe(720);
    expect(body.data[0].notes).toBe("test");
  });
});
