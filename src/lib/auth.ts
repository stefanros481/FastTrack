import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (user.email !== process.env.AUTHORIZED_EMAIL) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          image: user.image,
        },
        create: {
          email: user.email!,
          name: user.name,
          image: user.image,
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
    async jwt({ token, user, account }) {
      if (user?.email) {
        // For credentials provider, upsert the user here since signIn callback
        // doesn't get full profile data from OAuth
        if (account?.provider === "dev-credentials") {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
              email: user.email,
              name: user.name,
              settings: { create: {} },
            },
            select: { id: true },
          });
          token.sub = dbUser.id;
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          });
          if (dbUser) token.sub = dbUser.id;
        }
      }
      return token;
    },
  },
});
