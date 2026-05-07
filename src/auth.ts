import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

type AppRole = "admin" | "coordinator";

async function getRoleAndZoneForEmail(email: string | null | undefined): Promise<{
  role: AppRole | null;
  zoneId: string | null;
}> {
  if (!email) return { role: null, zoneId: null };
  const normalized = email.toLowerCase();
  if (
    process.env.SUPER_ADMIN_EMAIL &&
    normalized === process.env.SUPER_ADMIN_EMAIL.toLowerCase()
  ) {
    return { role: "admin", zoneId: null };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coordinators")
    .select("zone_id")
    .eq("email", normalized)
    .limit(1)
    .maybeSingle();

  if (error || !data?.zone_id) return { role: null, zoneId: null };
  return { role: "coordinator", zoneId: data.zone_id as string };
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      const { role } = await getRoleAndZoneForEmail(user.email);
      if (role !== null) return true;
      return "/auth/error?error=AccessDenied";
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const { role, zoneId } = await getRoleAndZoneForEmail(user.email);
        token.role = role;
        token.zoneId = zoneId;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as unknown as { role: unknown }).role = token.role ?? null;
      (session.user as unknown as { zoneId: unknown }).zoneId =
        token.zoneId ?? null;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler };
