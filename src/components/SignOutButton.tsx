"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="flex items-center gap-2 text-[--color-error] text-base min-h-11 font-medium"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  );
}
