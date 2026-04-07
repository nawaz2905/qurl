 import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    authProvider?: string;
    authError?: string;
    user?: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    authProvider?: string;
    authError?: string;
    userEmail?: string;
  }
}
