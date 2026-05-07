import "server-only";

import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";

import { sendReminderEmail } from "@/lib/email/send-reminder";
import {
  createReminderLog,
  getDefaultNotificationSettings,
  getMemberNotificationOverride,
  listAssignmentsInRange,
} from "@/lib/data/coordinator";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Trigger =
  | { type: "days_before"; value: number }
  | { type: "hours_before"; value: number }
  | { type: "day_of"; time: string };

function extractTriggers(raw: unknown): Trigger[] {
  if (!raw || typeof raw !== "object") return [];
  if (!("triggers" in raw)) return [];
  const maybe = (raw as { triggers?: unknown }).triggers;
  if (!Array.isArray(maybe)) return [];
  return maybe.filter((t): t is Trigger => !!t && typeof t === "object" && "type" in (t as object));
}

async function alreadySentRecently(assignmentId: string) {
  const supabase = getSupabaseAdmin();
  const since = addDays(new Date(), -1).toISOString();
  const { data, error } = await supabase
    .from("reminder_logs")
    .select("id,sent_at,status")
    .eq("assignment_id", assignmentId)
    .eq("status", "SENT")
    .gte("sent_at", since)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function runReminderCron() {
  const now = new Date();

  // Keep it simple: evaluate "days_before" triggers once per day.
  // Vercel cron can hit hourly; we only act at 09:00 UTC.
  const hour = now.getUTCHours();
  if (hour !== 9) return { attempted: 0, sent: 0, skipped: 0, failed: 0, reason: "Not scheduled hour" };

  const from = format(startOfDay(now), "yyyy-MM-dd");
  const to = format(addDays(startOfDay(now), 14), "yyyy-MM-dd");

  // We run per-zone implicitly by reading assignments; the email content embeds zone.
  // This is safe because we only use server-side service role credentials.
  // Assignments already join members and zones.
  const supabase = getSupabaseAdmin();
  const { data: zones, error: zonesErr } = await supabase.from("zones").select("id");
  if (zonesErr) throw zonesErr;

  let attempted = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const z of zones ?? []) {
    const rows = await listAssignmentsInRange({ zoneId: z.id, from, to });
    const defaults = await getDefaultNotificationSettings(z.id);
    const defaultTriggers = extractTriggers(defaults?.triggers);

    for (const row of rows) {
      attempted += 1;
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

      const override = member?.id
        ? await getMemberNotificationOverride({ zoneId: z.id, memberId: member.id })
        : null;
      const triggers = extractTriggers(override?.triggers ?? null);
      const effective = triggers.length ? triggers : defaultTriggers;

      // If there are no triggers configured, skip.
      if (!effective.length) {
        skipped += 1;
        continue;
      }

      // Currently implement only days_before triggers.
      const daysBefore = effective
        .filter((t): t is { type: "days_before"; value: number } => t.type === "days_before" && typeof (t as { value?: unknown }).value === "number")
        .map((t) => t.value);

      if (!daysBefore.length) {
        skipped += 1;
        continue;
      }

      const daysUntil = differenceInCalendarDays(new Date(row.assigned_date), startOfDay(now));
      const shouldSend = daysBefore.some((n) => n === daysUntil);

      if (!shouldSend) {
        skipped += 1;
        continue;
      }

      if (await alreadySentRecently(row.id)) {
        skipped += 1;
        continue;
      }

      try {
        await sendReminderEmail({
          to: memberEmail,
          memberName,
          assignedDate: row.assigned_date,
          deliveryAddress,
          coordinatorEmail: null,
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
  }

  return { attempted, sent, skipped, failed };
}

