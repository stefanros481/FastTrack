import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import "@/types/next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
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
    async signIn({ user, profile }) {
      if (user.email !== process.env.AUTHORIZED_EMAIL) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: profile?.name ?? user.name,
          image: profile?.image ?? user.image,
        },
        create: {
          email: user.email!,
          name: profile?.name ?? user.name,
          image: profile?.image ?? user.image,
          settings: { create: {} },
        },
      });

      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (dbUser) token.sub = dbUser.id;
      }
      return token;
    },
  },
});
