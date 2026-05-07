import "server-only";

import { addDays, startOfDay } from "date-fns";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getZone(zoneId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zones")
    .select("id,name,area,delivery_address,created_at")
    .eq("id", zoneId)
    .single();
  if (error) throw error;
  return data;
}

export async function getZoneSummary(zoneId: string) {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const from = startOfDay(now).toISOString();
  const to = addDays(startOfDay(now), 7).toISOString();

  const [{ data: members, error: membersErr }, { data: upcoming, error: upcomingErr }] =
    await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }).eq("zone_id", zoneId),
      supabase
        .from("assignments")
        .select("id,assigned_date,member:members(id,name,email)", { count: "exact" })
        .eq("zone_id", zoneId)
        .gte("assigned_date", from.slice(0, 10))
        .lte("assigned_date", to.slice(0, 10))
        .order("assigned_date", { ascending: true }),
    ]);

  if (membersErr) throw membersErr;
  if (upcomingErr) throw upcomingErr;

  return {
    memberCount: members?.length ?? 0,
    upcomingAssignments: upcoming ?? [],
  };
}

export async function listMembers(zoneId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("members")
    .select("id,name,email,phone,status,created_at")
    .eq("zone_id", zoneId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertMember(args: {
  zoneId: string;
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: "ACTIVE" | "INACTIVE";
}) {
  const supabase = getSupabaseAdmin();
  const row = {
    ...(args.id ? { id: args.id } : {}),
    zone_id: args.zoneId,
    name: args.name,
    email: args.email.toLowerCase(),
    phone: args.phone ?? null,
    status: args.status ?? "ACTIVE",
  };

  const { data, error } = await supabase.from("members").upsert(row).select().single();
  if (error) throw error;
  return data;
}

export async function setMemberStatus(args: { zoneId: string; memberId: string; status: "ACTIVE" | "INACTIVE" }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("members")
    .update({ status: args.status })
    .eq("zone_id", args.zoneId)
    .eq("id", args.memberId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listAssignmentsForMonth(args: { zoneId: string; from: string; to: string }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .select("id,assigned_date,member_id,member:members(id,name,email)")
    .eq("zone_id", args.zoneId)
    .gte("assigned_date", args.from)
    .lte("assigned_date", args.to)
    .order("assigned_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function assignMemberToDate(args: { zoneId: string; memberId: string; assignedDate: string; createdBy?: string }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      zone_id: args.zoneId,
      member_id: args.memberId,
      assigned_date: args.assignedDate,
      created_by: args.createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unassign(args: { zoneId: string; assignmentId: string }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("zone_id", args.zoneId)
    .eq("id", args.assignmentId);
  if (error) throw error;
}

export async function getDefaultNotificationSettings(zoneId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notification_settings")
    .select("id,triggers,is_default")
    .eq("zone_id", zoneId)
    .is("member_id", null)
    .eq("is_default", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function setDefaultNotificationSettings(args: { zoneId: string; triggers: unknown }) {
  const supabase = getSupabaseAdmin();
  const existing = await getDefaultNotificationSettings(args.zoneId);

  const payload = {
    ...(existing?.id ? { id: existing.id } : {}),
    zone_id: args.zoneId,
    member_id: null,
    is_default: true,
    triggers: args.triggers,
  };

  const { data, error } = await supabase
    .from("notification_settings")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMemberNotificationOverride(args: { zoneId: string; memberId: string }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notification_settings")
    .select("id,triggers,is_default,member_id")
    .eq("zone_id", args.zoneId)
    .eq("member_id", args.memberId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function setMemberNotificationOverride(args: { zoneId: string; memberId: string; triggers: unknown }) {
  const supabase = getSupabaseAdmin();
  const existing = await getMemberNotificationOverride({ zoneId: args.zoneId, memberId: args.memberId });

  const payload = {
    ...(existing?.id ? { id: existing.id } : {}),
    zone_id: args.zoneId,
    member_id: args.memberId,
    is_default: false,
    triggers: args.triggers,
  };

  const { data, error } = await supabase
    .from("notification_settings")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listAssignmentsInRange(args: { zoneId: string; from: string; to: string }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id,assigned_date,member:members(id,name,email),zone:zones(id,name,delivery_address)",
    )
    .eq("zone_id", args.zoneId)
    .gte("assigned_date", args.from)
    .lte("assigned_date", args.to)
    .order("assigned_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createReminderLog(args: { assignmentId: string; status: "SENT" | "FAILED"; error?: string | null }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reminder_logs")
    .insert({
      assignment_id: args.assignmentId,
      status: args.status,
      error: args.error ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listAutoAssignRules(memberIds: string[]) {
  const supabase = getSupabaseAdmin();
  if (!memberIds.length) return [];
  const { data, error } = await supabase
    .from("auto_assign_rules")
    .select("id,member_id,frequency_type,frequency_value,days_of_week,start_date,end_date,custom_dates,created_at,member:members(id,name,email,status)")
    .in("member_id", memberIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertAutoAssignRule(args: {
  memberId: string;
  frequencyType: "WEEKLY_DAYS" | "EVERY_N_WEEKS" | "EVERY_N_MONTHS" | "CUSTOM_DATES";
  frequencyValue?: number | null;
  daysOfWeek?: number[] | null;
  startDate: string;
  endDate?: string | null;
  customDates?: string[] | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("auto_assign_rules")
    .upsert({
      member_id: args.memberId,
      frequency_type: args.frequencyType,
      frequency_value: args.frequencyValue ?? null,
      days_of_week: args.daysOfWeek ?? [],
      start_date: args.startDate,
      end_date: args.endDate ?? null,
      custom_dates: args.customDates ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function bulkUpsertAssignments(args: { zoneId: string; memberId: string; dates: string[]; createdBy?: string | null }) {
  const supabase = getSupabaseAdmin();
  if (!args.dates.length) return { inserted: 0 };
  const rows = args.dates.map((d) => ({
    zone_id: args.zoneId,
    member_id: args.memberId,
    assigned_date: d,
    created_by: args.createdBy ?? null,
  }));
  const { data, error } = await supabase
    .from("assignments")
    .upsert(rows, { onConflict: "zone_id,member_id,assigned_date" })
    .select("id");
  if (error) throw error;
  return { inserted: data?.length ?? 0 };
}

