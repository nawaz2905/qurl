import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === "production" && !nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required in production");
}

async function exchangeGoogleUser(email: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/oauth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Google sign-in failed");
  }

  return data.token as string;
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return "/login?error=google_email_required";
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          token.backendToken = await exchangeGoogleUser(user.email);
          token.userEmail = user.email;
          token.authProvider = "google";
          delete token.authError;
        } catch (error) {
          token.authError = error instanceof Error ? error.message : "Google sign-in failed";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userEmail === "string") {
        session.user.email = token.userEmail;
      }

      if (typeof token.backendToken === "string") {
        session.backendToken = token.backendToken;
      }

      if (typeof token.authProvider === "string") {
        session.authProvider = token.authProvider;
      }

      if (typeof token.authError === "string") {
        session.authError = token.authError;
      }

      return session;
    },
  },
};
