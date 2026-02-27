import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getUserProfile,
  getTheme,
  getDefaultGoal,
  getNotificationSettings,
} from "@/app/actions/settings";
import ThemeProvider from "@/components/ThemeProvider";
import UserProfile from "@/components/UserProfile";
import DefaultGoalSetting from "@/components/DefaultGoalSetting";
import NotificationSettings from "@/components/NotificationSettings";
import SignOutButton from "@/components/SignOutButton";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const [profile, theme, defaultGoal, notificationSettings] = await Promise.all(
    [getUserProfile(), getTheme(), getDefaultGoal(), getNotificationSettings()]
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

          {/* Notifications Section */}
          <section>
            <h2 className="text-xl font-semibold text-[--color-text] mb-3">
              Notifications
            </h2>
            <div className="bg-[--color-card] rounded-2xl p-4">
              <NotificationSettings
                reminderEnabled={notificationSettings.reminderEnabled}
                reminderTime={notificationSettings.reminderTime}
                maxDurationMinutes={notificationSettings.maxDurationMinutes}
              />
            </div>
          </section>

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
