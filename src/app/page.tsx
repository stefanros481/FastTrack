import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveFast, getHistory, getStats } from "@/app/actions/fasting";
import { getTheme } from "@/app/actions/settings";
import FastingTimer from "@/components/FastingTimer";
import ThemeProvider from "@/components/ThemeProvider";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const [activeFast, history, stats, theme] = await Promise.all([
    getActiveFast(),
    getHistory(),
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
        history={history.map((s) => ({
          id: s.id,
          startedAt: s.startedAt.toISOString(),
          endedAt: s.endedAt!.toISOString(),
          goalMinutes: s.goalMinutes,
          notes: s.notes,
        }))}
        stats={stats}
      />
    </ThemeProvider>
  );
}
