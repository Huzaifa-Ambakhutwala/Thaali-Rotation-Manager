"use client";

import * as React from "react";
import { useActionState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { applyAutoAssign, previewAutoAssign, type PreviewState } from "./actions";

type Member = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
};

type ExistingRule = {
  id: string;
  member_id: string;
  frequency_type: string;
  frequency_value: number | null;
  days_of_week: number[];
  start_date: string;
  end_date: string | null;
  custom_dates: string[];
  member:
    | { id: string; name: string; email: string; status: string }
    | { id: string; name: string; email: string; status: string }[]
    | null;
};

export function AutoAssignClient({
  members,
  existingRules,
}: {
  members: Member[];
  existingRules: ExistingRule[];
}) {
  const [state, previewAction, previewPending] = useActionState<PreviewState | null, FormData>(
    previewAutoAssign,
    null,
  );

  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create / update rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Member</Label>
              <Select name="memberId" required>
                <SelectTrigger className="max-w-xl">
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
            </div>

            <div>
              <Label>Frequency type</Label>
              <Select name="frequencyType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY_DAYS">Weekly (days of week)</SelectItem>
                  <SelectItem value="EVERY_N_WEEKS">Every N weeks</SelectItem>
                  <SelectItem value="EVERY_N_MONTHS">Every N months</SelectItem>
                  <SelectItem value="CUSTOM_DATES">Custom dates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequencyValue">Frequency value (N)</Label>
              <Input id="frequencyValue" name="frequencyValue" type="number" min={1} placeholder="1" />
            </div>

            <div>
              <Label htmlFor="daysOfWeek">Days of week (0-6, comma separated)</Label>
              <Input id="daysOfWeek" name="daysOfWeek" placeholder="5 (Friday) or 1,3,5" />
            </div>

            <div>
              <Label htmlFor="customDates">Custom dates (yyyy-mm-dd, comma separated)</Label>
              <Input id="customDates" name="customDates" placeholder="2026-05-10, 2026-05-24" />
            </div>

            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="endDate">End date (optional)</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>

            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" formAction={previewAction} disabled={previewPending}>
                {previewPending ? "Previewing..." : "Preview"}
              </Button>

              <Button
                type="submit"
                variant="secondary"
                disabled={!state?.ok || previewPending}
                formAction={applyAutoAssign}
              >
                Apply to calendar
              </Button>
            </div>
          </form>

          {state ? (
            state.ok ? (
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Preview ({state.dates.length} dates)</div>
                <div className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
                  {state.dates.join(", ")}
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">{state.message}</p>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              Preview generates assignments for the next 3 months (or until end date).
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {existingRules.length ? (
            existingRules.map((r) => (
              <div key={r.id} className="rounded-lg border p-3">
                {(() => {
                  const m = Array.isArray(r.member) ? r.member[0] : r.member;
                  return (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    {m?.name ?? "Member"}{" "}
                    <span className="text-muted-foreground">({m?.email})</span>
                  </div>
                  <Badge variant="secondary">{r.frequency_type}</Badge>
                </div>
                  );
                })()}
                <Separator className="my-2" />
                <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>Start: {r.start_date}</div>
                  <div>End: {r.end_date ?? "—"}</div>
                  <div>N: {r.frequency_value ?? "—"}</div>
                  <div>Days: {r.days_of_week?.length ? r.days_of_week.join(",") : "—"}</div>
                </div>
                {r.custom_dates?.length ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Custom: {r.custom_dates.join(", ")}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No rules yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

