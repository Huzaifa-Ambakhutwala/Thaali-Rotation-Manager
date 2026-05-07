import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: "admin" | "coordinator" | null;
      zoneId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "coordinator" | null;
    zoneId?: string | null;
  }
}

export {};

