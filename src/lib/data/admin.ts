import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getAdminSummary() {
  const supabase = getSupabaseAdmin();
  const [zones, coords, members] = await Promise.all([
    supabase.from("zones").select("id", { count: "exact", head: true }),
    supabase.from("coordinators").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }),
  ]);
  if (zones.error) throw zones.error;
  if (coords.error) throw coords.error;
  if (members.error) throw members.error;
  return {
    zones: zones.data?.length ?? 0,
    coordinators: coords.data?.length ?? 0,
    members: members.data?.length ?? 0,
  };
}

export async function listZones() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zones")
    .select("id,name,area,delivery_address,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertZone(args: {
  id?: string;
  name: string;
  area?: string | null;
  deliveryAddress: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("zones")
    .upsert({
      ...(args.id ? { id: args.id } : {}),
      name: args.name,
      area: args.area ?? null,
      delivery_address: args.deliveryAddress,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteZone(zoneId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("zones").delete().eq("id", zoneId);
  if (error) throw error;
}

export async function listCoordinators() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coordinators")
    .select("id,email,name,zone_id,zone:zones(id,name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertCoordinator(args: {
  id?: string;
  email: string;
  name?: string | null;
  zoneId: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coordinators")
    .upsert({
      ...(args.id ? { id: args.id } : {}),
      email: args.email.toLowerCase(),
      name: args.name ?? null,
      zone_id: args.zoneId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCoordinator(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("coordinators").delete().eq("id", id);
  if (error) throw error;
}

