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
  const { themeSchema } = await import("@/lib/validators");
  const validated = themeSchema.parse(theme);
  const userId = await getUserId();

  await prisma.userSettings.update({
    where: { userId },
    data: { theme: validated },
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

export async function getUserProfile(): Promise<{
  name: string | null;
  email: string;
  image: string | null;
}> {
  const userId = await getUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true },
  });

  if (!user) throw new Error("User not found");
  return user;
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

export async function getSafetySettings(): Promise<{
  maxDurationMinutes: number;
}> {
  const userId = await getUserId();

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      maxDurationMinutes: true,
    },
  });

  return {
    maxDurationMinutes: settings?.maxDurationMinutes ?? 720,
  };
}

export async function updateMaxDuration(minutes: number) {
  const { maxDurationMinutesSchema } = await import("@/lib/validators");
  maxDurationMinutesSchema.parse(minutes);
  const userId = await getUserId();

  await prisma.userSettings.update({
    where: { userId },
    data: { maxDurationMinutes: minutes },
  });
}

export async function getGamificationSettings(): Promise<{
  enabled: boolean | null;
  achievements: boolean;
  whosFasting: boolean;
  leaderboard: boolean;
  challenge: boolean;
}> {
  const userId = await getUserId();

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      gamificationEnabled: true,
      gamificationAchievements: true,
      gamificationWhosFasting: true,
      gamificationLeaderboard: true,
      gamificationChallenge: true,
    },
  });

  return {
    enabled: settings?.gamificationEnabled ?? null,
    achievements: settings?.gamificationAchievements ?? true,
    whosFasting: settings?.gamificationWhosFasting ?? true,
    leaderboard: settings?.gamificationLeaderboard ?? true,
    challenge: settings?.gamificationChallenge ?? true,
  };
}

export async function updateGamificationSettings(settings: {
  enabled?: boolean;
  achievements?: boolean;
  whosFasting?: boolean;
  leaderboard?: boolean;
  challenge?: boolean;
}) {
  const { gamificationSettingsSchema } = await import("@/lib/validators");
  const validated = gamificationSettingsSchema.parse(settings);
  const userId = await getUserId();

  const data: Record<string, boolean> = {};
  if (validated.enabled !== undefined) data.gamificationEnabled = validated.enabled;
  if (validated.achievements !== undefined) data.gamificationAchievements = validated.achievements;
  if (validated.whosFasting !== undefined) data.gamificationWhosFasting = validated.whosFasting;
  if (validated.leaderboard !== undefined) data.gamificationLeaderboard = validated.leaderboard;
  if (validated.challenge !== undefined) data.gamificationChallenge = validated.challenge;

  await prisma.userSettings.update({
    where: { userId },
    data,
  });
}
