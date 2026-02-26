import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveFast, getStats } from "@/app/actions/fasting";
import { getTheme } from "@/app/actions/settings";
import FastingTimer from "@/components/FastingTimer";
import ThemeProvider from "@/components/ThemeProvider";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const [activeFast, stats, theme] = await Promise.all([
    getActiveFast(),
    getStats(),
    getTheme(),
  ]);

  return (
    <ThemeProvider initialTheme={theme as "light" | "dark" | "system"}>
      <FastingTimer
        activeFast={
          activeFast
            ? {
                id: activeFast.id,
                startedAt: activeFast.startedAt.toISOString(),
                goalMinutes: activeFast.goalMinutes,
                notes: activeFast.notes,
              }
            : null
        }
        stats={stats}
      />
    </ThemeProvider>
  );
}
