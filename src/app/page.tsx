import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[--color-background] px-4 py-8">
      <h1 className="text-3xl font-bold text-[--color-text]">
        Welcome, {session?.user?.name ?? "there"}
      </h1>
      <p className="text-base text-[--color-text-muted] mt-2">
        FastTrack — your personal fasting tracker
      </p>
    </main>
  );
}
