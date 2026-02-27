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

export async function getNotificationSettings(): Promise<{
  reminderEnabled: boolean;
  reminderTime: string | null;
  maxDurationMinutes: number | null;
}> {
  const userId = await getUserId();

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      reminderEnabled: true,
      reminderTime: true,
      maxDurationMinutes: true,
    },
  });

  return {
    reminderEnabled: settings?.reminderEnabled ?? false,
    reminderTime: settings?.reminderTime ?? null,
    maxDurationMinutes: settings?.maxDurationMinutes ?? null,
  };
}

export async function updateReminderSettings(
  enabled: boolean,
  time: string | null
) {
  const { reminderTimeSchema } = await import("@/lib/validators");
  reminderTimeSchema.parse(time);
  const userId = await getUserId();

  await prisma.userSettings.update({
    where: { userId },
    data: { reminderEnabled: enabled, reminderTime: time },
  });
}

export async function updateMaxDuration(minutes: number | null) {
  const { maxDurationMinutesSchema } = await import("@/lib/validators");
  maxDurationMinutesSchema.parse(minutes);
  const userId = await getUserId();

  await prisma.userSettings.update({
    where: { userId },
    data: { maxDurationMinutes: minutes },
  });
}
