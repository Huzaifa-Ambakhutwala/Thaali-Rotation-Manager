import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/authz";
import { listCoordinators, listZones } from "@/lib/data/admin";

import { removeCoordinator, saveCoordinator } from "./actions";

export const dynamic = "force-dynamic";

export default async function CoordinatorsPage() {
  await requireAdmin();
  const [zones, coordinators] = await Promise.all([listZones(), listCoordinators()]);

  return (
    <AppShell title="Coordinators" nav="admin">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Allowlist a coordinator</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveCoordinator} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="coordinator@gmail.com" required />
              </div>
              <div>
                <Label htmlFor="name">Name (optional)</Label>
                <Input id="name" name="name" placeholder="Coordinator name" />
              </div>
              <div>
                <Label>Zone</Label>
                <Select name="zoneId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Button type="submit">Add</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All coordinators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coordinators.length ? (
                    coordinators.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.email}</TableCell>
                        <TableCell className="text-muted-foreground">{c.name ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {(() => {
                            const zone = (c as unknown as { zone?: unknown }).zone;
                            const zoneName = Array.isArray(zone)
                              ? (zone[0] as { name?: string } | undefined)?.name
                              : (zone as { name?: string } | undefined)?.name;
                            return zoneName ?? c.zone_id;
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={removeCoordinator.bind(null, c.id)}>
                            <Button type="submit" variant="outline" size="sm">
                              Remove
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        No coordinators yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

