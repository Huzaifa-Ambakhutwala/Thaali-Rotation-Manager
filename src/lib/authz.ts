import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

export async function requireCoordinator() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) redirect("/");
  if (session.user.role !== "coordinator") redirect("/admin");
  if (!session.user.zoneId) redirect("/auth/error");
  return { session, zoneId: session.user.zoneId };
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) redirect("/");
  if (session.user.role !== "admin") redirect("/dashboard");
  return { session };
}
