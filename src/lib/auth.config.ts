import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const providers: Provider[] = [Google];

if (process.env.NODE_ENV === "development") {
  providers.push(
    Credentials({
      id: "dev-credentials",
      name: "Dev Login",
      credentials: {},
      authorize() {
        return {
          id: "dev-user",
          email: process.env.AUTHORIZED_EMAIL!,
          name: "Dev User",
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
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
