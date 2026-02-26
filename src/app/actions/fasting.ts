"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  });
}

export async function getHistory() {
  const userId = await getUserId();

  return prisma.fastingSession.findMany({
    where: { userId, endedAt: { not: null } },
    orderBy: { startedAt: "desc" },
    take: 50,
  });
}

export interface FastingStats {
  totalHours: number;
  avgHours: number;
  longestFast: number;
  goalsMet: number;
  totalFasts: number;
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

  return { totalHours, avgHours, longestFast, goalsMet, totalFasts: sessions.length };
}
