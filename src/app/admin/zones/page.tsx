import { AppShell } from "@/components/app-shell";
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
import { requireAdmin } from "@/lib/authz";
import { listZones } from "@/lib/data/admin";

import { removeZone, saveZone } from "./actions";

export const dynamic = "force-dynamic";

export default async function ZonesPage() {
  await requireAdmin();
  const zones = await listZones();

  return (
    <AppShell title="Zones" nav="admin">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create zone</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveZone} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="name">Zone name</Label>
                <Input id="name" name="name" placeholder="North Zone" required />
              </div>
              <div>
                <Label htmlFor="area">City area</Label>
                <Input id="area" name="area" placeholder="Cedar Park" />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="deliveryAddress">Delivery address</Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="123 Masjid St, Austin, TX"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Delivery address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.length ? (
                    zones.map((z) => (
                      <TableRow key={z.id}>
                        <TableCell className="font-medium">{z.name}</TableCell>
                        <TableCell className="text-muted-foreground">{z.area ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{z.delivery_address}</TableCell>
                        <TableCell className="text-right">
                          <form action={removeZone.bind(null, z.id)}>
                            <Button type="submit" variant="outline" size="sm">
                              Delete
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        No zones yet.
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

