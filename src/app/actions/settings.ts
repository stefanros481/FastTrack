// Multi-user audit (009): all queries scoped by userId via getUserId() ✓
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateTheme(theme: string) {
  const userId = await getUserId();

  await prisma.userSettings.update({
    where: { userId },
    data: { theme },
  });
}

export async function getTheme(): Promise<string> {
  const userId = await getUserId();

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { theme: true },
  });

  return settings?.theme ?? "system";
}

export async function getDefaultGoal(): Promise<number | null> {
  const userId = await getUserId();

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { defaultGoalMinutes: true },
  });

  return settings?.defaultGoalMinutes ?? null;
}

export async function updateDefaultGoal(goalMinutes: number | null) {
  const userId = await getUserId();

  if (goalMinutes !== null) {
    const { goalMinutesSchema } = await import("@/lib/validators");
    goalMinutesSchema.parse(goalMinutes);
  }

  await prisma.userSettings.update({
    where: { userId },
    data: { defaultGoalMinutes: goalMinutes },
  });
}
