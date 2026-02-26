import { signIn } from "@/lib/auth";
import { Flame, Timer, BarChart3, Zap } from "lucide-react";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;

  const isAccessDenied = error === "AccessDenied";
  const isOAuthError = error && !isAccessDenied;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm motion-safe:animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            FastTrack
          </h1>
          <p className="text-slate-500 mt-1">
            Your personal fasting tracker
          </p>
        </div>

        {/* Feature highlights */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                <Timer className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Track your fasts
                </div>
                <div className="text-xs text-slate-500">
                  Start, stop, and monitor with a live timer
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Metabolic milestones
                </div>
                <div className="text-xs text-slate-500">
                  See when ketosis, autophagy, and fat burning kick in
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Insights & history
                </div>
                <div className="text-xs text-slate-500">
                  Review your progress and personal bests
                </div>
              </div>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl min-h-12 px-6 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <form
              action={async () => {
                "use server";
                await signIn("dev-credentials", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="w-full mt-3 bg-amber-600 text-white rounded-2xl min-h-12 px-6 font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                Dev Login
              </button>
            </form>
          )}
        </div>

        {/* Error messages */}
        {isAccessDenied && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-center animate-shake">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              This app is private. Access denied.
            </p>
          </div>
        )}
        {isOAuthError && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              Sign-in is temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Private app — authorized accounts only
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}
