"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCoordinator } from "@/lib/authz";
import { setMemberStatus, upsertMember } from "@/lib/data/coordinator";

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
});

export async function saveMember(formData: FormData) {
  const { zoneId } = await requireCoordinator();

  const parsed = upsertSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() || null,
  });

  if (!parsed.success) throw new Error("Invalid member input.");

  await upsertMember({ zoneId, ...parsed.data });
  revalidatePath("/dashboard/members");
}

export async function deactivateMember(memberId: string) {
  const { zoneId } = await requireCoordinator();
  await setMemberStatus({ zoneId, memberId, status: "INACTIVE" });
  revalidatePath("/dashboard/members");
}

export async function activateMember(memberId: string) {
  const { zoneId } = await requireCoordinator();
  await setMemberStatus({ zoneId, memberId, status: "ACTIVE" });
  revalidatePath("/dashboard/members");
}

