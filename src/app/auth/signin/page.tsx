import { signIn } from "@/lib/auth";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams;

  const isAccessDenied = error === "AccessDenied";
  const isOAuthError = error && !isAccessDenied;

  return (
    <main className="min-h-screen bg-[--color-background] flex items-center justify-center px-4">
      <div className="bg-[--color-card] rounded-2xl p-4 shadow-sm motion-safe:animate-fade-in w-full max-w-sm">
        <h1 className="text-3xl font-bold text-[--color-text]">FastTrack</h1>
        <p className="text-base text-[--color-text-muted] mt-1 mb-6">
          Your personal fasting tracker
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-[--color-primary] text-white rounded-full min-h-11 min-w-11 px-6 font-medium hover:bg-[--color-primary-dark] transition-colors flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </form>

        <div className="mt-4 min-h-6">
          {isAccessDenied && (
            <p className="text-[--color-error] text-base animate-shake text-center">
              This app is private. Access denied.
            </p>
          )}
          {isOAuthError && (
            <p className="text-[--color-error] text-base text-center">
              Sign-in is temporarily unavailable. Please try again later.
            </p>
          )}
        </div>
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
