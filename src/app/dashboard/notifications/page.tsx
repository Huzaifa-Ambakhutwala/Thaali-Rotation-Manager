import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireCoordinator } from "@/lib/authz";
import { getDefaultNotificationSettings, listMembers } from "@/lib/data/coordinator";

import { saveDefaultTriggers, saveMemberTriggers } from "./actions";

export const dynamic = "force-dynamic";

const defaultTriggersExample = {
  triggers: [{ type: "days_before", value: 2 }, { type: "day_of", time: "07:00" }],
  timezone: "America/Chicago",
};

export default async function NotificationsPage() {
  const { zoneId } = await requireCoordinator();
  const [members, defaults] = await Promise.all([listMembers(zoneId), getDefaultNotificationSettings(zoneId)]);

  return (
    <AppShell title="Notifications" nav="coordinator">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Defaults apply to all members unless a per-member override exists.
            </p>
            <form action={saveDefaultTriggers} className="space-y-2">
              <Label htmlFor="defaultTriggers">Triggers (JSON)</Label>
              <Textarea
                id="defaultTriggers"
                name="triggers"
                className="min-h-40 font-mono text-xs"
                defaultValue={JSON.stringify(defaults?.triggers ?? defaultTriggersExample, null, 2)}
              />
              <Button type="submit">Save defaults</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-member override</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Override the triggers for a specific member.
            </p>
            <form action={saveMemberTriggers} className="space-y-2">
              <Label>Member</Label>
              <Select name="memberId" required>
                <SelectTrigger className="max-w-lg">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="memberTriggers">Triggers (JSON)</Label>
              <Textarea
                id="memberTriggers"
                name="triggers"
                className="min-h-40 font-mono text-xs"
                defaultValue={JSON.stringify(defaultTriggersExample, null, 2)}
              />
              <Button type="submit">Save override</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

