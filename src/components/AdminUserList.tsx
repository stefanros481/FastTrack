"use client";

import { useState, useTransition } from "react";
import {
  Shield,
  ShieldOff,
  UserX,
  UserCheck,
  Crown,
  Users,
} from "lucide-react";
import {
  deactivateUser,
  reactivateUser,
  promoteToAdmin,
  demoteFromAdmin,
} from "@/app/actions/admin";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface AdminUserListProps {
  users: User[];
  totalCount: number;
  maxUsers: number;
  currentUserId: string;
}

export default function AdminUserList({
  users,
  totalCount,
  maxUsers,
  currentUserId,
}: AdminUserListProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const adminCount = users.filter((u) => u.role === "admin").length;
  const isLastAdmin = (userId: string) =>
    users.find((u) => u.id === userId)?.role === "admin" && adminCount <= 1;

  async function handleAction(
    action: (userId: string) => Promise<{ error?: string; success?: boolean }>,
    userId: string
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action(userId);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* User count */}
      <div className="flex items-center gap-2 text-sm text-[--color-text-muted]">
        <Users size={16} />
        <span>
          {totalCount} / {maxUsers} users
        </span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-3 animate-shake">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const isAdmin = user.role === "admin";
          const lastAdmin = isLastAdmin(user.id);

          return (
            <div
              key={user.id}
              className={`bg-[--color-card] rounded-2xl p-4 border ${
                !user.isActive
                  ? "border-red-200 dark:border-red-900 opacity-60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[--color-text] truncate">
                      {user.name || user.email}
                    </span>
                    {isSelf && (
                      <span className="text-xs text-[--color-text-muted]">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[--color-text-muted] truncate">
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Role badge */}
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                        <Crown size={10} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        User
                      </span>
                    )}
                    {/* Active status badge */}
                    {!user.isActive && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isSelf && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Activate/Deactivate */}
                  {user.isActive ? (
                    <button
                      onClick={() => handleAction(deactivateUser, user.id)}
                      disabled={isPending || lastAdmin}
                      title={
                        lastAdmin
                          ? "Cannot deactivate the last admin"
                          : "Deactivate user"
                      }
                      className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UserX size={14} />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(reactivateUser, user.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors disabled:opacity-40"
                    >
                      <UserCheck size={14} />
                      Reactivate
                    </button>
                  )}

                  {/* Promote/Demote */}
                  {user.isActive && (
                    <>
                      {isAdmin ? (
                        <button
                          onClick={() =>
                            handleAction(demoteFromAdmin, user.id)
                          }
                          disabled={isPending || lastAdmin}
                          title={
                            lastAdmin
                              ? "Cannot demote the last admin"
                              : "Demote to user"
                          }
                          className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShieldOff size={14} />
                          Demote
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleAction(promoteToAdmin, user.id)
                          }
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors disabled:opacity-40"
                        >
                          <Shield size={14} />
                          Promote
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
