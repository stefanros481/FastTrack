import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { isAuthorizedEmail } from "@/lib/authorized-emails";

const devProviders =
  process.env.NODE_ENV === "development"
    ? [
        Credentials({
          id: "dev-credentials",
          name: "Dev Login",
          credentials: {
            email: { type: "text" },
          },
          authorize(credentials) {
            const email = credentials?.email as string;
            if (!email || !isAuthorizedEmail(email)) return null;
            return {
              id: `dev-${email}`,
              email,
              name: `Dev (${email.split("@")[0]})`,
            };
          },
        }),
      ]
    : [];

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...devProviders],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!isAuthorizedEmail(user.email)) return false;
      const email = user.email!;

      await prisma.user.upsert({
        where: { email },
        update: {
          name: user.name,
          image: user.image,
        },
        create: {
          email,
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
