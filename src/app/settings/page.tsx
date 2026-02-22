import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <main className="min-h-screen bg-[--color-background] px-4 py-8">
      <h1 className="text-3xl font-bold text-[--color-text]">Settings</h1>

      <div className="mt-8">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/signin" });
          }}
        >
          <button
            type="submit"
            className="text-[--color-error] text-base min-h-11"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
