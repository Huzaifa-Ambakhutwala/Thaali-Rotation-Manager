"use client";

import * as React from "react";
import { format, isSameDay, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { createAssignment, deleteAssignment } from "./actions";

type Member = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
};

type Assignment = {
  id: string;
  assigned_date: string;
  member: { id: string; name: string; email: string } | { id: string; name: string; email: string }[] | null;
};

export function RotationsClient({
  monthLabel,
  days,
  members,
  assignments,
}: {
  monthLabel: string;
  days: { date: string; inMonth: boolean }[];
  members: Member[];
  assignments: Assignment[];
}) {
  const [selected, setSelected] = React.useState(days.find((d) => d.inMonth)?.date ?? days[0]?.date);

  const assignmentsForSelected = React.useMemo(() => {
    if (!selected) return [];
    const sel = parseISO(selected);
    return assignments.filter((a) => isSameDay(parseISO(a.assigned_date), sel));
  }, [assignments, selected]);

  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{monthLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 text-xs font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((d) => {
              const dayAssignments = assignments.filter((a) => a.assigned_date === d.date);
              const isSelected = selected === d.date;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelected(d.date)}
                  className={[
                    "group rounded-lg border p-2 text-left transition",
                    d.inMonth ? "bg-card" : "bg-muted/30",
                    isSelected ? "border-primary ring-2 ring-primary/20" : "hover:bg-accent",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium tabular-nums">{format(parseISO(d.date), "d")}</div>
                    {dayAssignments.length ? (
                      <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                        {dayAssignments.length}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayAssignments.slice(0, 2).map((a) => (
                      <div key={a.id} className="truncate text-xs text-muted-foreground">
                {(Array.isArray(a.member) ? a.member[0]?.name : a.member?.name) ?? "Member"}
                      </div>
                    ))}
                    {dayAssignments.length > 2 ? (
                      <div className="text-xs text-muted-foreground">+{dayAssignments.length - 2} more</div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium">{selected ? format(parseISO(selected), "EEE, MMM d") : "—"}</div>
            <div className="text-xs text-muted-foreground">Add or remove members for this date.</div>
          </div>

          <Separator />

          <form action={createAssignment} className="space-y-2">
            <input type="hidden" name="assignedDate" value={selected ?? ""} />
            <Label>Member</Label>
            <Select name="memberId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full" disabled={!selected || !activeMembers.length}>
              Assign
            </Button>
          </form>

          <Separator />

          <div className="space-y-2">
            {assignmentsForSelected.length ? (
              assignmentsForSelected.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border p-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {(Array.isArray(a.member) ? a.member[0]?.name : a.member?.name) ?? "Member"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {(Array.isArray(a.member) ? a.member[0]?.email : a.member?.email) ?? ""}
                    </div>
                  </div>
                  <form action={deleteAssignment.bind(null, a.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      Remove
                    </Button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No assignments on this date.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

