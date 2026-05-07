"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/authz";
import { deleteZone, upsertZone } from "@/lib/data/admin";

const zoneSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  area: z.string().optional().nullable(),
  deliveryAddress: z.string().min(1),
});

export async function saveZone(formData: FormData) {
  await requireAdmin();
  const parsed = zoneSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    name: formData.get("name")?.toString() ?? "",
    area: formData.get("area")?.toString() || null,
    deliveryAddress: formData.get("deliveryAddress")?.toString() ?? "",
  });
  if (!parsed.success) throw new Error("Invalid zone input.");
  await upsertZone(parsed.data);
  revalidatePath("/admin/zones");
}

export async function removeZone(zoneId: string) {
  await requireAdmin();
  await deleteZone(zoneId);
  revalidatePath("/admin/zones");
}

