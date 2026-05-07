-- Thaali Rotation Manager (v1) schema + RLS

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type member_status as enum ('ACTIVE', 'INACTIVE');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type reminder_status as enum ('SENT', 'FAILED');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type frequency_type as enum ('WEEKLY_DAYS', 'EVERY_N_WEEKS', 'EVERY_N_MONTHS', 'CUSTOM_DATES');
exception
  when duplicate_object then null;
end $$;

-- Core tables
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text,
  delivery_address text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coordinators (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id) on delete cascade,
  name text,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  status member_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  unique(zone_id, email)
);

create index if not exists members_zone_id_idx on public.members(zone_id);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  assigned_date date not null,
  created_by text,
  created_at timestamptz not null default now(),
  unique(zone_id, member_id, assigned_date)
);

create index if not exists assignments_zone_date_idx on public.assignments(zone_id, assigned_date);

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  triggers jsonb not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notification_settings_zone_id_idx on public.notification_settings(zone_id);
create index if not exists notification_settings_member_id_idx on public.notification_settings(member_id);

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  sent_at timestamptz not null default now(),
  status reminder_status not null,
  error text
);

create index if not exists reminder_logs_assignment_sent_idx on public.reminder_logs(assignment_id, sent_at);

create table if not exists public.auto_assign_rules (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  frequency_type frequency_type not null,
  frequency_value int,
  days_of_week int[] not null default '{}',
  start_date date not null,
  end_date date,
  custom_dates date[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists auto_assign_rules_member_id_idx on public.auto_assign_rules(member_id);

-- RLS helper: map auth email -> coordinator record
create or replace function public.current_coordinator_zone_id()
returns uuid
language sql
stable
as $$
  select c.zone_id
  from public.coordinators c
  where lower(c.email) = lower(auth.jwt()->>'email')
  limit 1
$$;

-- RLS: enable on all public tables
alter table public.zones enable row level security;
alter table public.coordinators enable row level security;
alter table public.members enable row level security;
alter table public.assignments enable row level security;
alter table public.notification_settings enable row level security;
alter table public.reminder_logs enable row level security;
alter table public.auto_assign_rules enable row level security;

-- Policies (coordinator scoped by zone)
do $$ begin
  create policy "coordinator_select_zone" on public.zones
    for select to authenticated
    using (id = public.current_coordinator_zone_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator_select_coordinators" on public.coordinators
    for select to authenticated
    using (zone_id = public.current_coordinator_zone_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator_manage_members" on public.members
    for all to authenticated
    using (zone_id = public.current_coordinator_zone_id())
    with check (zone_id = public.current_coordinator_zone_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator_manage_assignments" on public.assignments
    for all to authenticated
    using (zone_id = public.current_coordinator_zone_id())
    with check (zone_id = public.current_coordinator_zone_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator_manage_notification_settings" on public.notification_settings
    for all to authenticated
    using (zone_id = public.current_coordinator_zone_id())
    with check (zone_id = public.current_coordinator_zone_id());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator_select_reminder_logs" on public.reminder_logs
    for select to authenticated
    using (
      exists (
        select 1
        from public.assignments a
        where a.id = reminder_logs.assignment_id
          and a.zone_id = public.current_coordinator_zone_id()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "coordinator_manage_auto_assign_rules" on public.auto_assign_rules
    for all to authenticated
    using (
      exists (
        select 1
        from public.members m
        where m.id = auto_assign_rules.member_id
          and m.zone_id = public.current_coordinator_zone_id()
      )
    )
    with check (
      exists (
        select 1
        from public.members m
        where m.id = auto_assign_rules.member_id
          and m.zone_id = public.current_coordinator_zone_id()
      )
    );
exception when duplicate_object then null; end $$;

