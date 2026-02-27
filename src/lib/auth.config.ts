import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isAuthorizedEmail } from "@/lib/authorized-emails";

export const authConfig = {
  providers: [Google],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth }) {
      if (!auth) return false;
      if (!auth.user?.email) return false;
      if (!isAuthorizedEmail(auth.user.email)) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
