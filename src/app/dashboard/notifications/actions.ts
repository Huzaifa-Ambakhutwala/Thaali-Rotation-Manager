"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCoordinator } from "@/lib/authz";
import { setDefaultNotificationSettings, setMemberNotificationOverride } from "@/lib/data/coordinator";

const jsonSchema = z.string().min(2);

export async function saveDefaultTriggers(formData: FormData) {
  const { zoneId } = await requireCoordinator();
  const triggersRaw = formData.get("triggers")?.toString() ?? "";
  const parsed = jsonSchema.safeParse(triggersRaw);
  if (!parsed.success) throw new Error("Invalid triggers JSON.");

  const triggers = JSON.parse(parsed.data) as unknown;
  await setDefaultNotificationSettings({ zoneId, triggers });
  revalidatePath("/dashboard/notifications");
}

export async function saveMemberTriggers(formData: FormData) {
  const { zoneId } = await requireCoordinator();
  const memberId = formData.get("memberId")?.toString() ?? "";
  const triggersRaw = formData.get("triggers")?.toString() ?? "";

  if (!z.string().uuid().safeParse(memberId).success) throw new Error("Invalid member.");
  const parsed = jsonSchema.safeParse(triggersRaw);
  if (!parsed.success) throw new Error("Invalid triggers JSON.");

  const triggers = JSON.parse(parsed.data) as unknown;
  await setMemberNotificationOverride({ zoneId, memberId, triggers });
  revalidatePath("/dashboard/notifications");
}

