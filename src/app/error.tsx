"use client";

import * as React from "react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell title="Something went wrong" showNav={false}>
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error.message || "Unexpected error."}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => reset()}>Try again</Button>
              <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
                Go home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

