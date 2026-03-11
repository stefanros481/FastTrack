import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUsers } from "@/app/actions/admin";
import AdminUserList from "@/components/AdminUserList";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "admin") redirect("/settings");

  const result = await getUsers();
  if ("error" in result && result.error) redirect("/settings");

  const { users, totalCount, maxUsers } = result as {
    users: Array<{
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }>;
    totalCount: number;
    maxUsers: number;
  };

  return (
    <main className="min-h-screen bg-[--color-background] px-4 py-8 motion-safe:animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/settings"
          className="min-h-11 min-w-11 flex items-center justify-center rounded-full bg-[--color-card]"
        >
          <ArrowLeft size={20} className="text-[--color-text]" />
        </Link>
        <h1 className="text-3xl font-bold text-[--color-text]">
          User Management
        </h1>
      </div>

      <AdminUserList
        users={users}
        totalCount={totalCount}
        maxUsers={maxUsers}
        currentUserId={session.user.id}
      />
    </main>
  );
}
