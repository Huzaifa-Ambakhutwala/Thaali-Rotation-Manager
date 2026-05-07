"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCoordinator } from "@/lib/authz";
import { generateDates } from "@/lib/auto-assign/generate";
import { bulkUpsertAssignments, upsertAutoAssignRule } from "@/lib/data/coordinator";

const baseSchema = z.object({
  memberId: z.string().uuid(),
  frequencyType: z.enum(["WEEKLY_DAYS", "EVERY_N_WEEKS", "EVERY_N_MONTHS", "CUSTOM_DATES"]),
  frequencyValue: z.coerce.number().int().positive().optional(),
  daysOfWeek: z.string().optional(), // comma separated
  customDates: z.string().optional(), // comma separated
  startDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  endDate: z.string().optional(),
});

export type PreviewState =
  | { ok: true; dates: string[] }
  | { ok: false; message: string };

function parseDaysOfWeek(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

function parseDates(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function previewAutoAssign(_prev: PreviewState | null, formData: FormData): Promise<PreviewState> {
  await requireCoordinator();
  const parsed = baseSchema.safeParse({
    memberId: formData.get("memberId")?.toString() ?? "",
    frequencyType: formData.get("frequencyType")?.toString() ?? "",
    frequencyValue: formData.get("frequencyValue")?.toString() ?? undefined,
    daysOfWeek: formData.get("daysOfWeek")?.toString() ?? "",
    customDates: formData.get("customDates")?.toString() ?? "",
    startDate: formData.get("startDate")?.toString() ?? "",
    endDate: formData.get("endDate")?.toString() ?? "",
  });
  if (!parsed.success) return { ok: false, message: "Invalid rule input." };

  const endDate = parsed.data.endDate?.trim() ? parsed.data.endDate.trim() : null;

  try {
    const rule =
      parsed.data.frequencyType === "WEEKLY_DAYS"
        ? ({
            frequencyType: "WEEKLY_DAYS",
            daysOfWeek: parseDaysOfWeek(parsed.data.daysOfWeek),
            startDate: parsed.data.startDate,
            endDate,
          } as const)
        : parsed.data.frequencyType === "EVERY_N_WEEKS"
          ? ({
              frequencyType: "EVERY_N_WEEKS",
              frequencyValue: parsed.data.frequencyValue ?? 1,
              startDate: parsed.data.startDate,
              endDate,
            } as const)
          : parsed.data.frequencyType === "EVERY_N_MONTHS"
            ? ({
                frequencyType: "EVERY_N_MONTHS",
                frequencyValue: parsed.data.frequencyValue ?? 1,
                startDate: parsed.data.startDate,
                endDate,
              } as const)
            : ({
                frequencyType: "CUSTOM_DATES",
                customDates: parseDates(parsed.data.customDates),
                startDate: parsed.data.startDate,
                endDate,
              } as const);

    const dates = generateDates(rule, 3);
    return { ok: true, dates };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed to preview." };
  }
}

export async function applyAutoAssign(formData: FormData) {
  const { zoneId, session } = await requireCoordinator();
  const parsed = baseSchema.safeParse({
    memberId: formData.get("memberId")?.toString() ?? "",
    frequencyType: formData.get("frequencyType")?.toString() ?? "",
    frequencyValue: formData.get("frequencyValue")?.toString() ?? undefined,
    daysOfWeek: formData.get("daysOfWeek")?.toString() ?? "",
    customDates: formData.get("customDates")?.toString() ?? "",
    startDate: formData.get("startDate")?.toString() ?? "",
    endDate: formData.get("endDate")?.toString() ?? "",
  });
  if (!parsed.success) throw new Error("Invalid rule input.");

  const endDate = parsed.data.endDate?.trim() ? parsed.data.endDate.trim() : null;
  const daysOfWeek = parseDaysOfWeek(parsed.data.daysOfWeek);
  const customDates = parseDates(parsed.data.customDates);

  const preview = await previewAutoAssign(null, formData);
  if (!preview.ok) throw new Error(preview.message);

  await upsertAutoAssignRule({
    memberId: parsed.data.memberId,
    frequencyType: parsed.data.frequencyType,
    frequencyValue: parsed.data.frequencyValue ?? null,
    daysOfWeek,
    startDate: parsed.data.startDate,
    endDate,
    customDates,
  });

  await bulkUpsertAssignments({
    zoneId,
    memberId: parsed.data.memberId,
    dates: preview.dates,
    createdBy: session.user.email ?? null,
  });

  revalidatePath("/dashboard/rotations");
  revalidatePath("/dashboard/auto-assign");
}

