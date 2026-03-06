import { Flame, Hash, Clock, CalendarCheck, Target } from "lucide-react";
import {
  startOfDay,
  differenceInCalendarDays,
  startOfISOWeek,
  endOfISOWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  min,
} from "date-fns";
import type {
  Badge,
  BadgeCategory,
  ComputedBadgeState,
  EarnedBadge,
  BadgeProgress,
} from "@/types/badges";

// --- Badge Definitions ---

export const BADGES: Badge[] = [
  // Streak
  { id: "streak-3", category: "streak", threshold: 3, label: "3-Day Streak", description: "Fast 3 days in a row", icon: Flame },
  { id: "streak-7", category: "streak", threshold: 7, label: "Week Warrior", description: "Fast 7 days in a row", icon: Flame },
  { id: "streak-14", category: "streak", threshold: 14, label: "Two-Week Titan", description: "Fast 14 days in a row", icon: Flame },
  { id: "streak-30", category: "streak", threshold: 30, label: "Monthly Master", description: "Fast 30 days in a row", icon: Flame },
  { id: "streak-60", category: "streak", threshold: 60, label: "Iron Will", description: "Fast 60 days in a row", icon: Flame },
  { id: "streak-100", category: "streak", threshold: 100, label: "Century Streak", description: "Fast 100 days in a row", icon: Flame },
  // Volume
  { id: "volume-10", category: "volume", threshold: 10, label: "Getting Started", description: "Complete 10 fasts", icon: Hash },
  { id: "volume-50", category: "volume", threshold: 50, label: "Dedicated", description: "Complete 50 fasts", icon: Hash },
  { id: "volume-100", category: "volume", threshold: 100, label: "Centurion", description: "Complete 100 fasts", icon: Hash },
  { id: "volume-250", category: "volume", threshold: 250, label: "Veteran", description: "Complete 250 fasts", icon: Hash },
  { id: "volume-500", category: "volume", threshold: 500, label: "Legend", description: "Complete 500 fasts", icon: Hash },
  // Duration
  { id: "duration-18h", category: "duration", threshold: 18, label: "Extended Fast", description: "Complete your first 18-hour fast", icon: Clock },
  { id: "duration-24h", category: "duration", threshold: 24, label: "Full Day", description: "Complete your first 24-hour fast", icon: Clock },
  { id: "duration-100h", category: "duration", threshold: 100, label: "Century Hours", description: "Accumulate 100 total fasting hours", icon: Clock },
  // Consistency
  { id: "consistency-week", category: "consistency", threshold: 1, label: "Perfect Week", description: "Fast every day of an ISO week", icon: CalendarCheck },
  { id: "consistency-month", category: "consistency", threshold: 1, label: "Perfect Month", description: "Fast every day of a calendar month", icon: CalendarCheck },
  // Goals
  { id: "goals-10", category: "goals", threshold: 10, label: "Goal Getter", description: "Meet your fasting goal 10 times", icon: Target },
  { id: "goals-50", category: "goals", threshold: 50, label: "Goal Crusher", description: "Meet your fasting goal 50 times", icon: Target },
  { id: "goals-100", category: "goals", threshold: 100, label: "Goal Machine", description: "Meet your fasting goal 100 times", icon: Target },
];

export const BADGE_CATEGORIES: { key: BadgeCategory; label: string }[] = [
  { key: "streak", label: "Streak" },
  { key: "volume", label: "Volume" },
  { key: "duration", label: "Duration" },
  { key: "consistency", label: "Consistency" },
  { key: "goals", label: "Goals" },
];

// --- Badge Computation ---

interface SessionInput {
  startedAt: Date;
  endedAt: Date | null;
  goalMinutes: number | null;
}

export function computeBadges(sessions: SessionInput[]): ComputedBadgeState {
  const completed = sessions.filter((s) => s.endedAt !== null) as Array<{
    startedAt: Date;
    endedAt: Date;
    goalMinutes: number | null;
  }>;

  if (completed.length === 0) {
    return {
      earned: [],
      progress: buildProgress("streak", 0, "volume", 0, "duration", 0, "consistency", 0, 0, "goals", 0),
    };
  }

  // Unique session dates (by endedAt day)
  const sessionDates = new Set<string>();
  for (const s of completed) {
    sessionDates.add(startOfDay(s.endedAt).toISOString());
  }

  // Sorted unique dates
  const sortedDates = Array.from(sessionDates).sort().map((d) => new Date(d));

  // --- Streak ---
  let bestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInCalendarDays(sortedDates[i], sortedDates[i - 1]);
    if (diff === 1) {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else if (diff > 1) {
      currentStreak = 1;
    }
    // diff === 0 means same day, skip (shouldn't happen with Set)
  }

  // --- Volume ---
  const volume = completed.length;

  // --- Duration ---
  let has18h = false;
  let has24h = false;
  let totalHours = 0;
  for (const s of completed) {
    const hours = Math.min((s.endedAt.getTime() - s.startedAt.getTime()) / (1000 * 60 * 60), 24);
    if (hours >= 18) has18h = true;
    if (hours >= 24) has24h = true;
    totalHours += hours;
  }

  // --- Consistency ---
  const today = startOfDay(new Date());
  let perfectWeeks = 0;
  let perfectMonths = 0;

  // Check all ISO weeks that have sessions
  const weeksSeen = new Set<string>();
  for (const date of sortedDates) {
    const weekStart = startOfISOWeek(date);
    const key = weekStart.toISOString();
    if (weeksSeen.has(key)) continue;
    weeksSeen.add(key);

    const weekEnd = min([endOfISOWeek(date), today]);
    if (weekEnd < weekStart) continue;
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    // Only count as perfect if we have the full week (7 days) unless it's the current week
    const isCurrentWeek = weekStart.getTime() === startOfISOWeek(today).getTime();
    if (!isCurrentWeek && days.length < 7) continue;
    const allPresent = days.every((d) => sessionDates.has(startOfDay(d).toISOString()));
    if (allPresent && days.length === 7) perfectWeeks++;
  }

  const monthsSeen = new Set<string>();
  for (const date of sortedDates) {
    const monthStart = startOfMonth(date);
    const key = monthStart.toISOString();
    if (monthsSeen.has(key)) continue;
    monthsSeen.add(key);

    const monthEnd = min([endOfMonth(date), today]);
    if (monthEnd < monthStart) continue;
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const isCurrentMonth = monthStart.getTime() === startOfMonth(today).getTime();
    if (!isCurrentMonth && days.length < 28) continue; // skip partial months
    const expectedDays = eachDayOfInterval({ start: monthStart, end: endOfMonth(date) }).length;
    const allPresent = days.every((d) => sessionDates.has(startOfDay(d).toISOString()));
    if (allPresent && days.length === expectedDays) perfectMonths++;
  }

  // --- Goals ---
  const goalsMet = completed.filter((s) => {
    if (!s.goalMinutes) return false;
    const durationMinutes = (s.endedAt.getTime() - s.startedAt.getTime()) / (1000 * 60);
    return durationMinutes >= s.goalMinutes;
  }).length;

  // --- Build earned badges ---
  const earned: EarnedBadge[] = [];

  // Streak badges
  for (const badge of BADGES.filter((b) => b.category === "streak")) {
    if (bestStreak >= badge.threshold) {
      earned.push({ badgeId: badge.id, earnedDate: new Date().toISOString() });
    }
  }

  // Volume badges
  for (const badge of BADGES.filter((b) => b.category === "volume")) {
    if (volume >= badge.threshold) {
      earned.push({ badgeId: badge.id, earnedDate: new Date().toISOString() });
    }
  }

  // Duration badges
  if (has18h) earned.push({ badgeId: "duration-18h", earnedDate: new Date().toISOString() });
  if (has24h) earned.push({ badgeId: "duration-24h", earnedDate: new Date().toISOString() });
  if (totalHours >= 100) earned.push({ badgeId: "duration-100h", earnedDate: new Date().toISOString() });

  // Consistency badges
  if (perfectWeeks >= 1) earned.push({ badgeId: "consistency-week", earnedDate: new Date().toISOString() });
  if (perfectMonths >= 1) earned.push({ badgeId: "consistency-month", earnedDate: new Date().toISOString() });

  // Goals badges
  for (const badge of BADGES.filter((b) => b.category === "goals")) {
    if (goalsMet >= badge.threshold) {
      earned.push({ badgeId: badge.id, earnedDate: new Date().toISOString() });
    }
  }

  // --- Build progress ---
  const progress = buildProgress(
    "streak", bestStreak,
    "volume", volume,
    "duration", totalHours,
    "consistency", perfectWeeks, perfectMonths,
    "goals", goalsMet,
  );

  return { earned, progress };
}

function buildProgress(
  _s: "streak", streakVal: number,
  _v: "volume", volumeVal: number,
  _d: "duration", durationVal: number,
  _c: "consistency", consistencyWeeks: number, consistencyMonths: number,
  _g: "goals", goalsVal: number,
): BadgeProgress[] {
  const progress: BadgeProgress[] = [];

  // Streak progress
  const streakBadges = BADGES.filter((b) => b.category === "streak");
  const nextStreak = streakBadges.find((b) => streakVal < b.threshold);
  progress.push({
    category: "streak",
    nextBadgeId: nextStreak?.id ?? null,
    current: streakVal,
    target: nextStreak?.threshold ?? streakBadges[streakBadges.length - 1].threshold,
  });

  // Volume progress
  const volumeBadges = BADGES.filter((b) => b.category === "volume");
  const nextVolume = volumeBadges.find((b) => volumeVal < b.threshold);
  progress.push({
    category: "volume",
    nextBadgeId: nextVolume?.id ?? null,
    current: volumeVal,
    target: nextVolume?.threshold ?? volumeBadges[volumeBadges.length - 1].threshold,
  });

  // Duration progress (use total hours for the cumulative badge)
  const durationBadges = BADGES.filter((b) => b.category === "duration");
  const nextDuration = durationBadges.find((b) => {
    if (b.id === "duration-100h") return durationVal < b.threshold;
    // Single-session badges don't have meaningful "progress" — they're earned or not
    return false;
  });
  progress.push({
    category: "duration",
    nextBadgeId: nextDuration?.id ?? null,
    current: Math.floor(durationVal),
    target: nextDuration?.threshold ?? 100,
  });

  // Consistency progress — show weeks progress (simpler metric)
  const consistencyBadges = BADGES.filter((b) => b.category === "consistency");
  const needsWeek = consistencyWeeks < 1;
  const needsMonth = consistencyMonths < 1;
  const nextConsistency = needsWeek
    ? consistencyBadges.find((b) => b.id === "consistency-week")
    : needsMonth
      ? consistencyBadges.find((b) => b.id === "consistency-month")
      : null;
  progress.push({
    category: "consistency",
    nextBadgeId: nextConsistency?.id ?? null,
    current: needsWeek ? consistencyWeeks : consistencyMonths,
    target: nextConsistency?.threshold ?? 1,
  });

  // Goals progress
  const goalsBadges = BADGES.filter((b) => b.category === "goals");
  const nextGoals = goalsBadges.find((b) => goalsVal < b.threshold);
  progress.push({
    category: "goals",
    nextBadgeId: nextGoals?.id ?? null,
    current: goalsVal,
    target: nextGoals?.threshold ?? goalsBadges[goalsBadges.length - 1].threshold,
  });

  return progress;
}
