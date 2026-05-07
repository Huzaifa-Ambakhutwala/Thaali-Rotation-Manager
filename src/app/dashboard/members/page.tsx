import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireCoordinator } from "@/lib/authz";
import { listMembers } from "@/lib/data/coordinator";

import { activateMember, deactivateMember, saveMember } from "./actions";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { zoneId } = await requireCoordinator();
  const members = await listMembers(zoneId);

  return (
    <AppShell title="Zone Members" nav="coordinator">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add member</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveMember} className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Full name" required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@gmail.com" required />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" name="phone" placeholder="(555) 555-5555" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length ? (
                    members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.email}</TableCell>
                        <TableCell>
                          <Badge variant={m.status === "ACTIVE" ? "secondary" : "outline"}>
                            {m.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {m.status === "ACTIVE" ? (
                            <form action={deactivateMember.bind(null, m.id)}>
                              <Button variant="outline" size="sm" type="submit">
                                Deactivate
                              </Button>
                            </form>
                          ) : (
                            <form action={activateMember.bind(null, m.id)}>
                              <Button variant="secondary" size="sm" type="submit">
                                Activate
                              </Button>
                            </form>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        No members yet.
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

