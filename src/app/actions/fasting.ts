"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  sessionEditSchema,
  noteSchema,
  deleteSessionSchema,
  activeStartTimeSchema,
} from "@/lib/validators";
import {
  startOfDay,
  differenceInCalendarDays,
  startOfISOWeek,
  startOfMonth,
} from "date-fns";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function startFast(goalMinutes?: number) {
  const userId = await getUserId();

  const existing = await prisma.fastingSession.findFirst({
    where: { userId, endedAt: null },
  });
  if (existing) throw new Error("A fast is already active");

  const session = await prisma.fastingSession.create({
    data: {
      userId,
      startedAt: new Date(),
      goalMinutes: goalMinutes ?? null,
    },
  });

  revalidatePath("/");
  return session;
}

export async function stopFast(sessionId: string) {
  const userId = await getUserId();

  const session = await prisma.fastingSession.update({
    where: { id: sessionId, userId },
    data: { endedAt: new Date() },
  });

  revalidatePath("/");
  return session;
}

export async function getActiveFast() {
  const userId = await getUserId();

  return prisma.fastingSession.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      startedAt: true,
      goalMinutes: true,
      notes: true,
    },
  });
}

export async function getHistory() {
  const userId = await getUserId();

  return prisma.fastingSession.findMany({
    where: { userId, endedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    take: 50,
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
      goalMinutes: true,
      notes: true,
    },
  });
}

export type DeleteSessionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteSession(
  sessionId: string
): Promise<DeleteSessionResult> {
  try {
    const userId = await getUserId();

    const parsed = deleteSessionSchema.safeParse({ sessionId });
    if (!parsed.success) {
      return { success: false, error: "Invalid session ID" };
    }

    await prisma.fastingSession.delete({
      where: { id: sessionId, userId },
    });

    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Session not found" };
  }
}

export type UpdateSessionResult =
  | { success: true }
  | { success: false; error: string; field?: string };

export async function updateSession(
  sessionId: string,
  startedAt: Date,
  endedAt: Date
): Promise<UpdateSessionResult> {
  const userId = await getUserId();

  const parsed = sessionEditSchema.safeParse({ sessionId, startedAt, endedAt });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue.message,
      field: firstIssue.path[0] as string | undefined,
    };
  }

  // Verify session belongs to user
  const existing = await prisma.fastingSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!existing) {
    return { success: false, error: "Session not found" };
  }

  // Check for overlapping sessions
  const overlap = await prisma.fastingSession.findFirst({
    where: {
      userId,
      id: { not: sessionId },
      startedAt: { lt: endedAt },
      endedAt: { gt: startedAt },
    },
  });
  if (overlap) {
    return { success: false, error: "This overlaps with another session" };
  }

  await prisma.fastingSession.update({
    where: { id: sessionId, userId },
    data: { startedAt, endedAt },
  });

  revalidatePath("/");
  return { success: true };
}

export type UpdateActiveStartTimeResult =
  | { success: true }
  | { success: false; error: string };

export async function updateActiveStartTime(
  sessionId: string,
  newStartedAt: Date
): Promise<UpdateActiveStartTimeResult> {
  const userId = await getUserId();

  const parsed = activeStartTimeSchema.safeParse({
    sessionId,
    startedAt: newStartedAt,
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue.message };
  }

  // Verify session belongs to user and is active
  const existing = await prisma.fastingSession.findFirst({
    where: { id: sessionId, userId, endedAt: null },
  });
  if (!existing) {
    return { success: false, error: "Active session not found" };
  }

  // Check overlap with completed sessions
  // Active session spans [newStartedAt, now). A completed session overlaps
  // if its endedAt > newStartedAt AND its startedAt < now.
  const overlap = await prisma.fastingSession.findFirst({
    where: {
      userId,
      id: { not: sessionId },
      AND: [
        { endedAt: { not: null } },
        { endedAt: { gt: newStartedAt } },
      ],
      startedAt: { lt: new Date() },
    },
  });
  if (overlap) {
    return { success: false, error: "This overlaps with another session" };
  }

  await prisma.fastingSession.update({
    where: { id: sessionId, userId },
    data: { startedAt: newStartedAt },
  });

  revalidatePath("/");
  return { success: true };
}

export type UpdateNoteResult =
  | { success: true }
  | { success: false; error: string };

export async function updateNote(
  sessionId: string,
  note: string | null
): Promise<UpdateNoteResult> {
  const userId = await getUserId();

  const parsed = noteSchema.safeParse({ sessionId, note });
  if (!parsed.success) {
    return { success: false, error: "Note must be 280 characters or less" };
  }

  const trimmedNote = note?.trim() || null;
  const noteValue = trimmedNote === "" ? null : trimmedNote;

  const existing = await prisma.fastingSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!existing) {
    return { success: false, error: "Session not found" };
  }

  await prisma.fastingSession.update({
    where: { id: sessionId, userId },
    data: { notes: noteValue },
  });

  revalidatePath("/");
  return { success: true };
}

export interface PeriodSummary {
  count: number;
  totalHours: number;
}

export interface FastingStats {
  totalHours: number;
  avgHours: number;
  longestFast: number;
  goalsMet: number;
  totalFasts: number;
  currentStreak: number;
  bestStreak: number;
  thisWeek: PeriodSummary;
  thisMonth: PeriodSummary;
}

export async function getStats(): Promise<FastingStats | null> {
  const userId = await getUserId();

  const sessions = await prisma.fastingSession.findMany({
    where: { userId, endedAt: { not: null } },
    select: { startedAt: true, endedAt: true, goalMinutes: true },
  });

  if (sessions.length === 0) return null;

  const durations = sessions.map(
    (s) => (s.endedAt!.getTime() - s.startedAt.getTime()) / (1000 * 60 * 60)
  );

  const totalHours = durations.reduce((a, b) => a + b, 0);
  const avgHours = totalHours / durations.length;
  const longestFast = Math.max(...durations);
  const goalsMet = sessions.filter((s) => {
    if (!s.goalMinutes) return false;
    const durationMinutes =
      (s.endedAt!.getTime() - s.startedAt.getTime()) / (1000 * 60);
    return durationMinutes >= s.goalMinutes;
  }).length;

  // Streak computation
  const today = startOfDay(new Date());
  const uniqueDates = [
    ...new Set(
      sessions
        .map((s) => startOfDay(s.endedAt!).getTime())
    ),
  ]
    .sort((a, b) => b - a)
    .map((t) => new Date(t));

  let currentStreak = 0;
  if (uniqueDates.length > 0) {
    const daysSinceLatest = differenceInCalendarDays(today, uniqueDates[0]);
    if (daysSinceLatest === 0) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        if (differenceInCalendarDays(uniqueDates[i - 1], uniqueDates[i]) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  let bestStreak = 0;
  if (uniqueDates.length > 0) {
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      if (differenceInCalendarDays(uniqueDates[i - 1], uniqueDates[i]) === 1) {
        streak++;
      } else {
        bestStreak = Math.max(bestStreak, streak);
        streak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, streak);
  }

  // Period summaries
  const weekStart = startOfISOWeek(new Date());
  const monthStart = startOfMonth(new Date());

  const weekSessions = sessions.filter((s) => s.endedAt! >= weekStart);
  const monthSessions = sessions.filter((s) => s.endedAt! >= monthStart);

  const sumHours = (arr: typeof sessions) =>
    arr.reduce(
      (sum, s) =>
        sum + (s.endedAt!.getTime() - s.startedAt.getTime()) / 3600000,
      0
    );

  return {
    totalHours,
    avgHours,
    longestFast,
    goalsMet,
    totalFasts: sessions.length,
    currentStreak,
    bestStreak,
    thisWeek: { count: weekSessions.length, totalHours: Math.round(sumHours(weekSessions) * 10) / 10 },
    thisMonth: { count: monthSessions.length, totalHours: Math.round(sumHours(monthSessions) * 10) / 10 },
  };
}
