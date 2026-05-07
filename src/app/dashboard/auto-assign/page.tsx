import { AppShell } from "@/components/app-shell";
import { requireCoordinator } from "@/lib/authz";
import { listAutoAssignRules, listMembers } from "@/lib/data/coordinator";

import { AutoAssignClient } from "./ui";

export const dynamic = "force-dynamic";

export default async function AutoAssignPage() {
  const { zoneId } = await requireCoordinator();
  const members = await listMembers(zoneId);
  const rules = await listAutoAssignRules(members.map((m) => m.id));

  return (
    <AppShell title="Auto Assign" nav="coordinator">
      <AutoAssignClient members={members} existingRules={rules} />
    </AppShell>
  );
}

