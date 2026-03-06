import type { LucideIcon } from "lucide-react";

export type BadgeCategory = "streak" | "volume" | "duration" | "consistency" | "goals";

export interface Badge {
  id: string;
  category: BadgeCategory;
  threshold: number;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface EarnedBadge {
  badgeId: string;
  earnedDate: string; // ISO date string
}

export interface BadgeProgress {
  category: BadgeCategory;
  nextBadgeId: string | null;
  current: number;
  target: number;
}

export interface ComputedBadgeState {
  earned: EarnedBadge[];
  progress: BadgeProgress[];
}
