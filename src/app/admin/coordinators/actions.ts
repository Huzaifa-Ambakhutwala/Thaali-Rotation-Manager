"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/authz";
import { deleteCoordinator, upsertCoordinator } from "@/lib/data/admin";

const coordinatorSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().optional().nullable(),
  zoneId: z.string().uuid(),
});

export async function saveCoordinator(formData: FormData) {
  await requireAdmin();
  const parsed = coordinatorSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    email: formData.get("email")?.toString() ?? "",
    name: formData.get("name")?.toString() || null,
    zoneId: formData.get("zoneId")?.toString() ?? "",
  });
  if (!parsed.success) throw new Error("Invalid coordinator input.");
  await upsertCoordinator(parsed.data);
  revalidatePath("/admin/coordinators");
}

export async function removeCoordinator(id: string) {
  await requireAdmin();
  await deleteCoordinator(id);
  revalidatePath("/admin/coordinators");
}

