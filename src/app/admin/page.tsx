import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/authz";
import { getAdminSummary } from "@/lib/data/admin";
import { SupabaseAdminNotConfiguredError } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { session } = await requireAdmin();
  let summary: Awaited<ReturnType<typeof getAdminSummary>> | null = null;
  let needsSupabaseConfig = false;
  try {
    summary = await getAdminSummary();
  } catch (err) {
    if (err instanceof SupabaseAdminNotConfiguredError) needsSupabaseConfig = true;
    else throw err;
  }

  return (
    <AppShell title="Admin" nav="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Super Admin</h1>
          <Badge variant="secondary">{session.user.email}</Badge>
        </div>

        {needsSupabaseConfig ? (
          <Card>
            <CardHeader>
              <CardTitle>Finish setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The Admin dashboard needs Supabase admin credentials to read zones/coordinators/members.
              </p>
              <div className="rounded-md border bg-muted/40 p-3 font-mono text-xs">
                <div>SUPABASE_URL=...</div>
                <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Add them to <span className="font-medium text-foreground">.env.local</span> and restart the dev
                server.
              </p>
              <a href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
                Back to home
              </a>
            </CardContent>
          </Card>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{summary.zones}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Coordinators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{summary.coordinators}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{summary.members}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

