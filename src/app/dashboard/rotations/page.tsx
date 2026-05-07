import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { requireCoordinator } from "@/lib/authz";
import { listAssignmentsForMonth, listMembers } from "@/lib/data/coordinator";

import { RotationsClient } from "./rotations-client";
import { SendRemindersCard } from "./send-reminders-card";

export const dynamic = "force-dynamic";

function buildMonthDays(year: number, monthIndex0: number) {
  const monthStart = startOfMonth(new Date(year, monthIndex0, 1));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: { date: string; inMonth: boolean }[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push({
      date: format(d, "yyyy-MM-dd"),
      inMonth: d >= monthStart && d <= monthEnd,
    });
  }
  return { monthStart, monthEnd, days };
}

export default async function RotationsPage() {
  const { zoneId } = await requireCoordinator();

  const now = new Date();
  const { monthStart, monthEnd, days } = buildMonthDays(now.getFullYear(), now.getMonth());

  const [members, assignments] = await Promise.all([
    listMembers(zoneId),
    listAssignmentsForMonth({
      zoneId,
      from: format(monthStart, "yyyy-MM-dd"),
      to: format(monthEnd, "yyyy-MM-dd"),
    }),
  ]);

  return (
    <AppShell title="Rotations" nav="coordinator">
      <div className="space-y-6">
        <SendRemindersCard />
        <RotationsClient
          monthLabel={format(monthStart, "MMMM yyyy")}
          days={days}
          members={members}
          assignments={assignments}
        />
      </div>
    </AppShell>
  );
}

