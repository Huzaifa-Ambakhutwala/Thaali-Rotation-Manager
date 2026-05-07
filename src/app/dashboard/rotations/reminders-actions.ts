"use server";

import { z } from "zod";

import { requireCoordinator } from "@/lib/authz";
import { sendReminderEmail } from "@/lib/email/send-reminder";
import { createReminderLog, listAssignmentsInRange } from "@/lib/data/coordinator";

const rangeSchema = z.object({
  from: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  to: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
});

export type SendRemindersState =
  | { ok: true; sent: number; failed: number }
  | { ok: false; message: string };

export async function sendRemindersInRange(
  _prev: SendRemindersState | null,
  formData: FormData,
): Promise<SendRemindersState> {
  const { zoneId, session } = await requireCoordinator();

  const parsed = rangeSchema.safeParse({
    from: formData.get("from")?.toString() ?? "",
    to: formData.get("to")?.toString() ?? "",
  });
  if (!parsed.success) return { ok: false, message: "Invalid date range." };

  const rows = await listAssignmentsInRange({ zoneId, from: parsed.data.from, to: parsed.data.to });

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const member = Array.isArray(row.member) ? row.member[0] : row.member;
    const zone = Array.isArray(row.zone) ? row.zone[0] : row.zone;

    const memberEmail = member?.email;
    const memberName = member?.name ?? "Member";
    const zoneName = zone?.name ?? "Zone";
    const deliveryAddress = zone?.delivery_address ?? "";

    if (!memberEmail || !deliveryAddress) {
      failed += 1;
      await createReminderLog({
        assignmentId: row.id,
        status: "FAILED",
        error: "Missing member email or delivery address.",
      });
      continue;
    }

    try {
      await sendReminderEmail({
        to: memberEmail,
        memberName,
        assignedDate: row.assigned_date,
        deliveryAddress,
        coordinatorEmail: session.user.email,
        zoneName,
      });
      sent += 1;
      await createReminderLog({ assignmentId: row.id, status: "SENT" });
    } catch (e) {
      failed += 1;
      await createReminderLog({
        assignmentId: row.id,
        status: "FAILED",
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return { ok: true, sent, failed };
}

