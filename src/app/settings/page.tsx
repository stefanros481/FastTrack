import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, ChevronRight } from "lucide-react";
import {
  getUserProfile,
  getTheme,
  getDefaultGoal,
  getSafetySettings,
  getGamificationSettings,
} from "@/app/actions/settings";
import ThemeProvider from "@/components/ThemeProvider";
import UserProfile from "@/components/UserProfile";
import DefaultGoalSetting from "@/components/DefaultGoalSetting";
import SafetySettings from "@/components/SafetySettings";
import GamificationSettings from "@/components/GamificationSettings";
import SignOutButton from "@/components/SignOutButton";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const [profile, theme, defaultGoal, safetySettings, gamificationSettings] = await Promise.all(
    [getUserProfile(), getTheme(), getDefaultGoal(), getSafetySettings(), getGamificationSettings()]
  );

  return (
    <ThemeProvider initialTheme={theme as "light" | "dark" | "system"}>
      <main className="min-h-screen bg-[--color-background] px-4 py-8 motion-safe:animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full bg-[--color-card]"
          >
            <ArrowLeft size={20} className="text-[--color-text]" />
          </Link>
          <h1 className="text-3xl font-bold text-[--color-text]">Settings</h1>
        </div>

        <div className="flex flex-col gap-8">
          {/* Profile Section */}
          <section>
            <div className="bg-[--color-card] rounded-2xl p-4">
              <UserProfile
                name={profile.name}
                email={profile.email}
                image={profile.image}
              />
            </div>
          </section>

          {/* Fasting Section */}
          <section>
            <h2 className="text-xl font-semibold text-[--color-text] mb-3">
              Fasting
            </h2>
            <div className="bg-[--color-card] rounded-2xl p-4">
              <DefaultGoalSetting currentDefault={defaultGoal} />
            </div>
          </section>

          {/* Safety Section */}
          <section>
            <h2 className="text-xl font-semibold text-[--color-text] mb-3">
              Safety
            </h2>
            <div className="bg-[--color-card] rounded-2xl p-4">
              <SafetySettings
                maxDurationMinutes={safetySettings.maxDurationMinutes}
              />
            </div>
          </section>

          {/* Community Section */}
          <section>
            <h2 className="text-xl font-semibold text-[--color-text] mb-3">
              Community
            </h2>
            <div className="bg-[--color-card] rounded-2xl p-4">
              <GamificationSettings
                enabled={gamificationSettings.enabled}
                achievements={gamificationSettings.achievements}
                whosFasting={gamificationSettings.whosFasting}
                leaderboard={gamificationSettings.leaderboard}
                challenge={gamificationSettings.challenge}
              />
            </div>
          </section>

          {/* Admin Section */}
          {session.user.role === "admin" && (
            <section>
              <h2 className="text-xl font-semibold text-[--color-text] mb-3">
                Admin
              </h2>
              <Link
                href="/settings/admin"
                className="bg-[--color-card] rounded-2xl p-4 flex items-center gap-3 min-h-11"
              >
                <Shield size={20} className="text-amber-600 dark:text-amber-400" />
                <span className="flex-1 text-sm font-semibold text-[--color-text]">
                  User Management
                </span>
                <ChevronRight size={16} className="text-[--color-text-muted]" />
              </Link>
            </section>
          )}

          {/* Account Section */}
          <section>
            <h2 className="text-xl font-semibold text-[--color-text] mb-3">
              Account
            </h2>
            <div className="bg-[--color-card] rounded-2xl p-4">
              <SignOutButton />
            </div>
          </section>
        </div>
      </main>
    </ThemeProvider>
  );
}
