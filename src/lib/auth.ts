import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const MAX_USERS = parseInt(process.env.MAX_USERS || "200", 10);

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
            if (!email) return null;
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
      const email = user.email;
      if (!email) return false;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, isActive: true },
      });

      // If user doesn't exist, check the cap
      if (!existingUser) {
        const userCount = await prisma.user.count();
        if (userCount >= MAX_USERS) {
          return "/auth/signin?error=RegistrationClosed";
        }
      }

      // If existing user is deactivated, block sign-in
      if (existingUser && !existingUser.isActive) {
        return "/auth/signin?error=AccountInactive";
      }

      // Upsert user — create if new, update name/image if existing (FR-011)
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
          role: "user",
          isActive: true,
          settings: { create: {} },
        },
      });

      // Auto-admin bootstrap: if no admin exists, promote this user
      const adminCount = await prisma.user.count({
        where: { role: "admin" },
      });
      if (adminCount === 0) {
        await prisma.user.update({
          where: { email },
          data: { role: "admin" },
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      if (typeof token.isActive === "boolean") {
        session.user.isActive = token.isActive;
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
            select: { id: true, role: true, isActive: true },
          });
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.isActive = dbUser.isActive;

          // Auto-admin bootstrap for dev login too
          const adminCount = await prisma.user.count({
            where: { role: "admin" },
          });
          if (adminCount === 0) {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: "admin" },
            });
            token.role = "admin";
          }
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, isActive: true },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.isActive = dbUser.isActive;
          }
        }
      }
      return token;
    },
  },
});
