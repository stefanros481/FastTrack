import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

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
    async authorized({ auth }) {
      if (!auth) return false;
      if (!auth.user?.email) return false;

      // Per-request DB check for immediate deactivation enforcement
      const user = await prisma.user.findUnique({
        where: { email: auth.user.email },
        select: { isActive: true },
      });

      if (!user || !user.isActive) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
