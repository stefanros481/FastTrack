"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeBadges } from "@/lib/badges";
import type { ComputedBadgeState } from "@/types/badges";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getBadges(): Promise<ComputedBadgeState | null> {
  const userId = await getUserId();

  const sessions = await prisma.fastingSession.findMany({
    where: { userId, endedAt: { not: null } },
    select: { startedAt: true, endedAt: true, goalMinutes: true },
    orderBy: { endedAt: "asc" },
  });

  if (sessions.length === 0) return null;

  return computeBadges(sessions);
}
