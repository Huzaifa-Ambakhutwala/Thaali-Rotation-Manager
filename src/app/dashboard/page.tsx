import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireCoordinator } from "@/lib/authz";
import { getZone, getZoneSummary } from "@/lib/data/coordinator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { zoneId, session } = await requireCoordinator();
  const [zone, summary] = await Promise.all([getZone(zoneId), getZoneSummary(zoneId)]);

  return (
    <AppShell title="Dashboard" nav="coordinator">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Welcome, {session.user.name ?? "Coordinator"}
            </h1>
            <Badge variant="secondary">{zone.name}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Delivery address: <span className="text-foreground">{zone.delivery_address}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{summary.memberCount}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Active/inactive members are managed in Zone Members.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming assignments (7 days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.upcomingAssignments.length ? (
                summary.upcomingAssignments.slice(0, 6).map((a) => {
                  const m = Array.isArray(a.member) ? a.member[0] : a.member;
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{m?.name ?? "Member"}</div>
                        <div className="truncate text-xs text-muted-foreground">{m?.email}</div>
                      </div>
                      <div className="text-sm tabular-nums">
                        {format(new Date(a.assigned_date), "EEE, MMM d")}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming assignments yet.</p>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground">
                Tip: use Rotations to assign dates, then send reminders when needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

