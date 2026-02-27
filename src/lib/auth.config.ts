import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { isAuthorizedEmail } from "@/lib/authorized-emails";

const providers: Provider[] = [Google];

if (process.env.NODE_ENV === "development") {
  providers.push(
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
    })
  );
}

export const authConfig = {
  providers,
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
