// Multi-user audit (009): all queries scoped by userId via session.user.id ✓
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfISOWeek, subWeeks, format, differenceInMinutes } from "date-fns";

const VALID_RANGES = new Set(["7", "30", "90"]);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const rangeParam = searchParams.get("range") || "7";
    const range = VALID_RANGES.has(rangeParam) ? parseInt(rangeParam, 10) : 7;

    const userId = session.user.id;
    const now = new Date();

    // Fetch all completed sessions for this user
    const allSessions = await prisma.fastingSession.findMany({
      where: {
        userId,
        endedAt: { not: null },
      },
      orderBy: { endedAt: "asc" },
      select: {
        startedAt: true,
        endedAt: true,
        goalMinutes: true,
      },
    });

    // Fetch user settings for default goal
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { defaultGoalMinutes: true },
    });

    // --- Duration data (range-filtered) ---
    const rangeStart = new Date(now.getTime() - range * 24 * 60 * 60 * 1000);
    const duration = allSessions
      .filter((s) => s.endedAt! >= rangeStart)
      .map((s) => {
        const durationMs = s.endedAt!.getTime() - s.startedAt.getTime();
        const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
        return {
          date: s.endedAt!.toISOString(),
          durationHours,
        };
      });

    // --- Weekly data (last 12 weeks) ---
    const currentWeekStart = startOfISOWeek(now);
    const weekStarts: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      weekStarts.push(subWeeks(currentWeekStart, i));
    }

    const weeklyMap = new Map<string, number>();
    for (const ws of weekStarts) {
      weeklyMap.set(format(ws, "yyyy-MM-dd"), 0);
    }

    const twelveWeeksAgo = weekStarts[0];
    for (const s of allSessions) {
      if (s.endedAt! < twelveWeeksAgo) continue;
      const sessionWeekStart = startOfISOWeek(s.endedAt!);
      const key = format(sessionWeekStart, "yyyy-MM-dd");
      if (weeklyMap.has(key)) {
        const durationMs = s.endedAt!.getTime() - s.startedAt.getTime();
        const hours = durationMs / (1000 * 60 * 60);
        weeklyMap.set(key, weeklyMap.get(key)! + hours);
      }
    }

    const weekly = weekStarts.map((ws) => {
      const key = format(ws, "yyyy-MM-dd");
      return {
        weekStart: key,
        totalHours: Math.round(weeklyMap.get(key)! * 10) / 10,
      };
    });

    // --- Goal rate (all-time, only sessions with goals) ---
    const sessionsWithGoals = allSessions.filter((s) => s.goalMinutes != null);
    const total = sessionsWithGoals.length;
    const hit = sessionsWithGoals.filter((s) => {
      const actualMinutes = differenceInMinutes(s.endedAt!, s.startedAt);
      return actualMinutes >= s.goalMinutes!;
    }).length;
    const percentage = total > 0 ? Math.round((hit / total) * 100) : 0;

    // --- Default goal ---
    const defaultGoalHours = settings?.defaultGoalMinutes
      ? settings.defaultGoalMinutes / 60
      : null;

    return NextResponse.json({
      duration,
      weekly,
      goalRate: { hit, total, percentage },
      defaultGoalHours,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
