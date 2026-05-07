"use client";

import * as React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { sendRemindersInRange, type SendRemindersState } from "./reminders-actions";

export function SendRemindersCard() {
  const [state, action, pending] = useActionState<SendRemindersState | null, FormData>(
    sendRemindersInRange,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" name="from" type="date" required />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="date" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>

        {state ? (
          state.ok ? (
            <p className="text-sm text-muted-foreground">
              Sent <span className="font-medium text-foreground">{state.sent}</span>{" "}
              emails, failed{" "}
              <span className="font-medium text-foreground">{state.failed}</span>.
            </p>
          ) : (
            <p className="text-sm text-destructive">{state.message}</p>
          )
        ) : (
          <p className="text-xs text-muted-foreground">
            This sends emails to members assigned in the selected range.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

